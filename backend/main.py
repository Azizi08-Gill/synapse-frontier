import uvicorn

if __name__ == "__main__":
    # Redirect to the new modular app
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
