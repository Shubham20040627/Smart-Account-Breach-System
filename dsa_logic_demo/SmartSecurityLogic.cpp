#include <iostream>
#include <vector>
#include <string>
#include <ctime>
#include <algorithm>

using namespace std;

// --- 1. CIRCULAR QUEUE (For Session Management) ---
class SessionQueue {
private:
    int capacity;
    vector<string> queue;
    int front;
    int rear;
    int count;

public:
    SessionQueue(int size) {
        capacity = size;
        queue.resize(capacity);
        front = 0;
        rear = -1;
        count = 0;
    }

    bool isFull() {
        return count == capacity;
    }

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

    void displaySessions() {
        cout << "Current Active Sessions: ";
        for (int i = 0; i < count; i++) {
            cout << queue[(front + i) % capacity] << " ";
        }
        cout << endl;
    }
};

// --- 2. SLIDING WINDOW (For Rate Limiting) ---
class RateLimiter {
private:
    vector<time_t> attempts;
    int windowSeconds;
    int maxAttempts;

public:
    RateLimiter(int seconds, int max) {
        windowSeconds = seconds;
        maxAttempts = max;
    }

    bool checkAttempt() {
        time_t now = time(0);
        attempts.push_back(now);

        // SLIDING WINDOW LOGIC: Remove attempts outside the time window
        attempts.erase(
            remove_if(attempts.begin(), attempts.end(), [&](time_t t) {
                return difftime(now, t) > windowSeconds;
            }),
            attempts.end()
        );

        if (attempts.size() > maxAttempts) {
            cout << "[BREACH] Too many attempts in " << windowSeconds << "s! LOCKING ACCOUNT." << endl;
            return false;
        }
        cout << "[OK] Attempt registered. Recent attempts: " << attempts.size() << "/" << maxAttempts << endl;
        return true;
    }
};

int main() {
    cout << "=== Smart Account Breach System: DSA Logic Demo (C++) ===" << endl << endl;

    // Demo 1: Circular Queue
    cout << "--- Testing Circular Queue (Session Limit: 3) ---" << endl;
    SessionQueue sessions(3);
    sessions.enqueue("192.168.1.1"); // Laptop
    sessions.enqueue("122.161.45.1"); // Phone
    sessions.enqueue("103.45.12.9");  // Tablet
    sessions.enqueue("1.1.1.1");      // HACKER (Should be blocked)
    sessions.displaySessions();
    cout << endl;

    // Demo 2: Sliding Window
    cout << "--- Testing Sliding Window (Limit: 3 fails in 5 seconds) ---" << endl;
    RateLimiter limiter(5, 3);
    limiter.checkAttempt();
    limiter.checkAttempt();
    limiter.checkAttempt();
    limiter.checkAttempt(); // Should trigger LOCKING

    return 0;
}
