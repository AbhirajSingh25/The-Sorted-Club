def test_admin_login_success(client):
    """Verify admin login with valid credentials returns 200 and access token."""
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "testadmin"

def test_admin_login_invalid_credentials(client):
    """Verify admin login with invalid password returns 401."""
    response = client.post("/api/admin/login", json={
        "username": "testadmin",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]

def test_verify_session_success(client, admin_headers):
    """Verify valid token can authenticate with GET /api/admin/verify."""
    response = client.get("/api/admin/verify", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "authenticated"

def test_verify_session_invalid_token(client):
    """Verify request with bad token returns 401."""
    response = client.get("/api/admin/verify", headers={"Authorization": "Bearer invalid_token_value"})
    assert response.status_code == 401

def test_protect_all_admin_endpoints(client):
    """Ensure all protected endpoints return 401 without authorization header."""
    endpoints = [
        ("GET", "/api/leads"),
        ("GET", "/api/leads/stats"),
        ("GET", "/api/leads/1"),
        ("PATCH", "/api/leads/1"),
        ("DELETE", "/api/leads/1"),
        ("GET", "/api/admin/verify")
    ]
    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        elif method == "PATCH":
            res = client.patch(path, json={"status": "CONTACTED"})
        elif method == "DELETE":
            res = client.delete(path)
        assert res.status_code == 401, f"Endpoint {method} {path} should be protected with 401"
