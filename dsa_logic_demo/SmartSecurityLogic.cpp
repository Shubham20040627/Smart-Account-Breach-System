#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <algorithm>

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
    bool checkAttempt() {
        time_t now = time(0);
        attempts.push_back(now);
        attempts.erase(remove_if(attempts.begin(), attempts.end(), [&](time_t t) {
            return difftime(now, t) > windowSeconds;
        }), attempts.end());

        if (attempts.size() > maxAttempts) {
            cout << "[BREACH] Rate Limit Exceeded in " << windowSeconds << "s! LOCKING ACCOUNT." << endl;
            return false;
        }
        cout << "[OK] Attempt registered. Recent attempts: " << attempts.size() << "/" << maxAttempts << endl;
        return true;
    }
};

int main(int argc, char* argv[]) {
    string currentDeviceId = (argc > 1) ? argv[1] : "unknown_device";
    
    cout << "=== Smart Account Breach System: C++ DSA Engine ===" << endl << endl;

    // 1. Device Identity Search (BST Transformation)
    cout << "--- Stage 1: Trusted Device Retrieval (DSA: Binary Search Tree) ---" << endl;
    DeviceVault vault;
    // Mocking existing trusted devices
    vault.addDevice("device_123");
    vault.addDevice("device_456");
    vault.addDevice("device_789");
    vault.addDevice("a1b2c3d4e5");

    cout << "[BST-SEARCH] Looking for Device ID: " << currentDeviceId << endl;
    if (vault.isTrusted(currentDeviceId)) {
        cout << "[VERIFIED] Device recognized in O(log N) steps. Access Granted." << endl;
    } else {
        cout << "[WARNING] NEW DEVICE detected! Path not found in BST. Triggering Security Alert." << endl;
    }
    cout << endl;

    // 2. Session Control (Circular Queue)
    cout << "--- Stage 2: Session Capacity Check (DSA: Circular Queue) ---" << endl;
    SessionQueue sessions(3);
    sessions.enqueue("192.168.1.1");
    sessions.enqueue("103.45.12.9");
    sessions.enqueue("172.16.0.1"); // 3rd IP
    sessions.enqueue("1.1.1.1");      // 4th IP -> TRIGGER BLOCK
    
    cout << "[ACTION] Simulating User Logout..." << endl;
    sessions.dequeue(); // Remove first IP
    sessions.enqueue("1.1.1.1");      // Now 1.1.1.1 should SUCCEED
    cout << "[INFO] Queue manages sessions in O(1) space." << endl << endl;

    // 3. Brute Force Check (Sliding Window)
    cout << "--- Stage 3: Brute Force Audit (DSA: Sliding Window) ---" << endl;
    RateLimiter limiter(5, 3);
    limiter.checkAttempt();
    limiter.checkAttempt();
    cout << "[REPORT] Logic Audit Complete. System Status: OPTIMIZED." << endl;

    return 0;
}
