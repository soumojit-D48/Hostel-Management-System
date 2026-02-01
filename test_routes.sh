#!/bin/bash

# Backend Routes Testing Script
BASE_URL="http://localhost:5002/api/v1"

echo "🧪 Testing Backend Routes"
echo "=========================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test a route
test_route() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing: $method $url${NC}"
    echo "Description: $description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL$url")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$url")
    elif [ "$method" = "PATCH" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X PATCH -H "Content-Type: application/json" -d "$data" "$BASE_URL$url")
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ] || [ "$http_code" -eq 401 ] || [ "$http_code" -eq 403 ]; then
        echo -e "${GREEN}✅ Status: $http_code${NC}"
    else
        echo -e "${RED}❌ Status: $http_code${NC}"
    fi
    
    echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
    echo "----------------------------------------"
    echo
}

# Test Data
REGISTER_DATA='{"name":"Test User","email":"test@example.com","password":"password123","role":"STUDENT","phone":"1234567890"}'
LOGIN_DATA='{"email":"test@example.com","password":"password123"}'
ISSUE_DATA='{"title":"Test Issue","description":"This is a test issue","category":"ELECTRICAL","priority":"MEDIUM","hostelId":"test-hostel","blockId":"test-block","roomNumber":"101"}'
ANNOUNCEMENT_DATA='{"title":"Test Announcement","content":"This is a test announcement","category":"GENERAL"}'
COMMENT_DATA='{"content":"This is a test comment","issueId":"test-issue"}'
REACTION_DATA='{"type":"LIKE","resourceType":"issue","resourceId":"test-issue"}'
LOST_FOUND_DATA='{"title":"Test Lost Item","description":"This is a test lost item","category":"ELECTRONICS","location":"Common Room"}'

echo "1. AUTHENTICATION ROUTES"
echo "========================"
test_route "GET" "/auth" "" "Auth base route"
test_route "POST" "/auth/register" "$REGISTER_DATA" "User registration"
test_route "POST" "/auth/login" "$LOGIN_DATA" "User login"
test_route "POST" "/auth/logout" "" "User logout"
test_route "GET" "/auth/verify-email?token=test" "" "Email verification"
test_route "POST" "/auth/forgot-password" '{"email":"test@example.com"}' "Forgot password"
test_route "POST" "/auth/reset-password" '{"token":"test","newPassword":"password123"}' "Reset password"

echo "2. HOSTELS ROUTES"
echo "================="
test_route "GET" "/hostels" "" "Get all hostels"
test_route "GET" "/hostels/test-id" "" "Get hostel by ID"
test_route "GET" "/hostels/test-id/blocks" "" "Get hostel blocks"

echo "3. ISSUES ROUTES"
echo "==============="
test_route "GET" "/issues" "" "Get issues"
test_route "POST" "/issues" "$ISSUE_DATA" "Create issue"
test_route "GET" "/issues/search?query=test" "" "Search issues"
test_route "GET" "/issues/test-id" "" "Get issue by ID"
test_route "PATCH" "/issues/test-id/status" '{"status":"RESOLVED"}' "Update issue status"
test_route "PATCH" "/issues/test-id/assign" '{"assignedTo":"test-user"}' "Assign issue"
test_route "GET" "/issues/test-id/similar" "" "Get similar issues"
test_route "POST" "/issues/test-id/merge" '{"targetIssueId":"test-target"}' "Merge issues"

echo "4. ANNOUNCEMENTS ROUTES"
echo "======================"
test_route "GET" "/announcements" "" "Get announcements"
test_route "POST" "/announcements" "$ANNOUNCEMENT_DATA" "Create announcement"
test_route "GET" "/announcements/unread-count" "" "Get unread count"
test_route "POST" "/announcements/test-id/mark-read" "" "Mark as read"

echo "5. COMMENTS ROUTES"
echo "================="
test_route "GET" "/comments" "" "Get comments"
test_route "POST" "/comments" "$COMMENT_DATA" "Create comment"
test_route "GET" "/comments/test-id" "" "Get comment by ID"
test_route "PATCH" "/comments/test-id" '{"content":"Updated comment"}' "Update comment"

echo "6. REACTIONS ROUTES"
echo "==================="
test_route "GET" "/reactions/counts" "" "Get reaction counts"
test_route "POST" "/reactions" "$REACTION_DATA" "Add reaction"
test_route "GET" "/reactions/user-reactions" "" "Get user reactions"
test_route "GET" "/reactions/resource" "" "Get reactions by resource"

echo "7. LOST & FOUND ROUTES"
echo "====================="
test_route "GET" "/lost-found" "" "Get lost-found items"
test_route "POST" "/lost-found" "$LOST_FOUND_DATA" "Create lost-found item"
test_route "GET" "/lost-found/search?query=test" "" "Search lost-found items"
test_route "GET" "/lost-found/test-id" "" "Get lost-found item by ID"
test_route "POST" "/lost-found/test-id/claim" '{"description":"This is my item"}' "Claim item"

echo "8. ANALYTICS ROUTES"
echo "=================="
test_route "GET" "/analytics/dashboard" "" "Get dashboard analytics"
test_route "GET" "/analytics/categories" "" "Get category breakdown"
test_route "GET" "/analytics/hostels" "" "Get hostel comparison"
test_route "GET" "/analytics/trends" "" "Get issue trends"
test_route "GET" "/analytics/rooms" "" "Get top rooms"
test_route "GET" "/analytics/peak-hours" "" "Get peak reporting hours"
test_route "GET" "/analytics/staff-performance" "" "Get staff performance"

echo "9. NOTIFICATIONS ROUTES"
echo "======================"
test_route "GET" "/notifications" "" "Get notifications"
test_route "GET" "/notifications/unread-count" "" "Get unread notifications count"
test_route "PATCH" "/notifications/test-id/read" "" "Mark notification as read"
test_route "PATCH" "/notifications/mark-all-read" "" "Mark all notifications as read"

echo "10. ADDITIONAL TESTS"
echo "===================="
test_route "GET" "/users/staff" "" "Get staff list (missing route?)"

echo "🏁 Testing Complete!"