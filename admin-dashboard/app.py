import os
import requests
import pandas as pd
import streamlit as st
import plotly.express as px
from datetime import date

# RULE 5: No hardcoded secrets. We pull the API URL from the environment, 
# or default to our local development server if it's not set.
API_URL = os.getenv("API_URL", "http://localhost:8000/api/v1")

def get_headers():
    """Helper to grab the token and format it for the backend."""
    token = st.session_state.get("token", "")
    return {"Authorization": f"Bearer {token}"}

def page_price_management():
    st.header("Price Management")
    
    # Show Current Prices
    st.subheader("Current Prices in Database")
    try:
        response_prices = requests.get(f"{API_URL}/admin/prices", headers=get_headers())
        if response_prices.status_code == 200:
            prices_data = response_prices.json()
            if prices_data:
                df_prices = pd.DataFrame(prices_data)
                st.dataframe(df_prices, use_container_width=True)
            else:
                st.info("No prices found in database.")
        else:
            st.error(f"Failed to fetch current prices: {response_prices.text}")
    except requests.exceptions.RequestException as e:
        st.error(f"Cannot connect to backend server: {e}")
        
    st.subheader("Update a Price")
    # A simple form where the admin types the new price
    with st.form("price_update_form"):
        produce_id = st.text_input("Produce ID (UUID)", placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000")
        pincode = st.text_input("Region Pincode Prefix", value="530")
        base_price = st.number_input("Base Price (₹)", min_value=0.0, format="%.2f")
        margin = st.number_input("Platform Margin (%)", min_value=0.0, max_value=100.0, value=5.0, format="%.2f")
        
        submitted = st.form_submit_button("Update Price")
        if submitted:
            payload = {
                "produce_id": produce_id,
                "region_pincode_prefix": pincode,
                "base_price": str(base_price),
                "platform_margin_pct": str(margin),
                "valid_date": str(date.today())
            }
            # Shoot the data to our FastAPI backend
            try:
                response = requests.post(f"{API_URL}/admin/prices", json=payload, headers=get_headers())
                
                if response.status_code == 200:
                    st.success("✅ Price updated successfully! Redis cache has been cleared.")
                else:
                    st.error(f"❌ Failed to update price: {response.text}")
            except requests.exceptions.RequestException as e:
                st.error(f"Cannot connect to backend server: {e}")

def page_transaction_log():
    st.header("Transaction Log")
    
    # 1. Date filters so the admin can search specific days
    col1, col2 = st.columns(2)
    with col1:
        date_from = st.date_input("From Date", value=date.today())
    with col2:
        date_to = st.date_input("To Date", value=date.today())
        
    if st.button("Load Transactions"):
        # 2. Ask the backend for the orders
        try:
            response = requests.get(
                f"{API_URL}/admin/transactions", 
                params={"date_from": str(date_from), "date_to": str(date_to)},
                headers=get_headers()
            )
            
            if response.status_code == 200:
                orders = response.json()
                if not orders:
                    st.info("No transactions found for this date range.")
                    return
                    
                df = pd.DataFrame(orders)
                
                # 3. Calculate and display total GMV (Gross Merchandise Value)
                total_gmv = df["total_amount"].sum()
                st.metric(label="Total GMV (₹)", value=f"₹{total_gmv:,.2f}")
                
                # 4. Show the raw table
                st.dataframe(df, use_container_width=True)
                
                # 5. Draw a nice Bar Chart of sales by Produce Type
                st.subheader("Sales by Produce")
                sales_by_produce = df.groupby("produce_name")["total_amount"].sum().reset_index()
                fig = px.bar(sales_by_produce, x="produce_name", y="total_amount", title="Total Sales Volume (₹)")
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.error(f"❌ Failed to fetch transactions: {response.text}")
        except requests.exceptions.RequestException as e:
            st.error(f"Cannot connect to backend server: {e}")

def page_listing_monitor():
    st.header("Listing Monitor")
    
    # Ask the backend for all farmer listings
    try:
        response = requests.get(f"{API_URL}/admin/listings", headers=get_headers())
        if response.status_code == 200:
            listings = response.json()
            if not listings:
                st.info("No listings found.")
                return
                
            df = pd.DataFrame(listings)
            
            # Add a dropdown to filter by Status (e.g., "accepted", "rejected")
            statuses = ["ALL"] + list(df["status"].unique())
            selected_status = st.selectbox("Filter by Status", statuses)
            
            if selected_status != "ALL":
                df = df[df["status"] == selected_status]
                
            st.dataframe(df, use_container_width=True)
        else:
            st.error(f"❌ Failed to fetch listings: {response.text}")
    except requests.exceptions.RequestException as e:
        st.error(f"Cannot connect to backend server: {e}")

def main():
    st.set_page_config(page_title="AgriConnect Admin", layout="wide")
    st.title("🚜 AgriConnect Admin Dashboard")
    
    # --- AUTHENTICATION GATE ---
    # The user types their token here. We save it in "session_state" so it remembers it while they click around.
    token_input = st.text_input("Admin JWT Token", type="password", help="Paste your admin token here")
    if token_input:
        st.session_state["token"] = token_input
        
    if not st.session_state.get("token"):
        st.warning("Not authenticated. Please enter your Admin token above.")
        st.stop() # This literally stops drawing the screen, hiding the secret pages!
        
    # --- NAVIGATION ---
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Go to", ["Price Management", "Transaction Log", "Listing Monitor"])
    
    if page == "Price Management":
        page_price_management()
    elif page == "Transaction Log":
        page_transaction_log()
    elif page == "Listing Monitor":
        page_listing_monitor()

if __name__ == "__main__":
    main()
