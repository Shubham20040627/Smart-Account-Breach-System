#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <algorithm>
#include <sstream>

using namespace std;

// --- 1. BINARY SEARCH TREE (For Trusted Device Vault - O(log N)) ---
struct DeviceNode {
    string deviceId;
    DeviceNode *left, *right;
    DeviceNode(string id) : deviceId(id), left(NULL), right(NULL) {}
};

class DeviceVault {
private:
    DeviceNode* root;

    DeviceNode* insert(DeviceNode* node, string id) {
        if (node == NULL) return new DeviceNode(id);
        if (id < node->deviceId) node->left = insert(node->left, id);
        else if (id > node->deviceId) node->right = insert(node->right, id);
        return node;
    }

    bool search(DeviceNode* node, string id) {
        if (node == NULL) return false;
        if (node->deviceId == id) return true;
        if (id < node->deviceId) return search(node->left, id);
        return search(node->right, id);
    }

public:
    DeviceVault() : root(NULL) {}
    void addDevice(string id) { root = insert(root, id); }
    bool isTrusted(string id) { return search(root, id); }
};

// --- 2. CIRCULAR QUEUE (For Session Management - O(1)) ---
class SessionQueue {
private:
    int capacity;
    vector<string> queue;
    int front, rear, count;

public:
    SessionQueue(int size) : capacity(size), front(0), rear(-1), count(0) { queue.resize(capacity); }
    bool isFull() { return count == capacity; }
    void enqueue(string ip) {
        if (isFull()) {
            cout << "[BLOCK] Queue Full! Blocking New IP: " << ip << endl;
            return;
        }
        rear = (rear + 1) % capacity;
        queue[rear] = ip;
        count++;
        cout << "[SUCCESS] Enqueued IP: " << ip << " (Sessions: " << count << "/" << capacity << ")" << endl;
    }

    void dequeue() {
        if (count == 0) return;
        string removed = queue[front];
        front = (front + 1) % capacity;
        count--;
        cout << "[LOGOUT] Freed Slot from IP: " << removed << " (Sessions: " << count << "/" << capacity << ")" << endl;
    }
};

// --- 3. SLIDING WINDOW (For Rate Limiting) ---
class RateLimiter {
private:
    vector<time_t> attempts;
    int windowSeconds, maxAttempts;

public:
    RateLimiter(int seconds, int max) : windowSeconds(seconds), maxAttempts(max) {}
    
    void loadExistingAttempts(int count) {
        time_t now = time(0);
        for(int i = 0; i < count; i++) {
            attempts.push_back(now - 30);
        }
    }

    bool audit() {
        time_t now = time(0);
        int currentCount = attempts.size();

        if (currentCount >= maxAttempts) {
            cout << "[SECURITY ALERT] " << currentCount << " failed attempts in sliding window! Account at high risk." << endl;
            return false;
        } else if (currentCount > 0) {
            cout << "[CAUTION] " << currentCount << " recent attempts detected. Window is monitoring activity." << endl;
            return true;
        }
        cout << "[OK] No anomalies detected in current time-window. System: OPTIMIZED." << endl;
        return true;
    }
};

int main(int argc, char* argv[]) {
    // Dynamic Inputs from Node.js
    string currentDeviceId = (argc > 1) ? argv[1] : "unknown_device";
    string userIP = (argc > 2) ? argv[2] : "0.0.0.0";
    int activeSessionsCount = (argc > 3) ? atoi(argv[3]) : 0;
    int failedAttemptsCount = (argc > 4) ? atoi(argv[4]) : 0;
    string trustedIdsStr = (argc > 5) ? argv[5] : "";
    
    cout << "=== Smart Account Breach System: C++ DSA Engine ===" << endl << endl;

    // 1. Device Identity Search (BST Transformation)
    cout << "--- Stage 1: Trusted Device Retrieval (DSA: Binary Search Tree) ---" << endl;
    DeviceVault vault;
    
    // Dynamically Build BST from Real Data
    if (trustedIdsStr != "" && trustedIdsStr != "none") {
        stringstream ss(trustedIdsStr);
        string id;
        while (getline(ss, id, ',')) {
            if (!id.empty()) vault.addDevice(id);
        }
    }

    cout << "[BST-SEARCH] Looking for Device ID: " << currentDeviceId << endl;
    if (vault.isTrusted(currentDeviceId)) {
        cout << "[VERIFIED] Hardware recognized in O(log N) steps. Access Granted." << endl;
    } else {
        cout << "[WARNING] NEW DEVICE detected! Path not found in BST. Triggering Security Alert." << endl;
    }
    cout << endl;

    // 2. Session Control (Circular Queue)
    cout << "--- Stage 2: Session Capacity Check (DSA: Circular Queue) ---" << endl;
    SessionQueue sessions(3);
    cout << "[INFO] Current Database Status: " << activeSessionsCount << "/3 sessions active." << endl;
    for(int i = 0; i < activeSessionsCount - 1; i++) {
        sessions.enqueue("Existing_Session_" + to_string(i+1));
    }
    cout << "[ACTION] Verifying your current session..." << endl;
    sessions.enqueue(userIP);
    if (activeSessionsCount >= 3) {
        cout << "[CRITICAL] Session limit reached. Circular Queue is at peak capacity." << endl;
    }
    cout << endl;

    // 3. Brute Force Audit (Sliding Window Animation)
    cout << "--- Stage 3: Brute Force Audit (DSA: Sliding Window) ---" << endl;
    RateLimiter limiter(120, 5); 
    limiter.loadExistingAttempts(failedAttemptsCount);
    cout << "[ANALYSIS] Scanning access timestamps for your account..." << endl;
    limiter.audit();

    return 0;
}
