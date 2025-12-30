const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'javaLearnerCurriculumPart2.ts');
const projectId = 'learner-project-7';

const submitted = `/**
 * Notification System with Interfaces and Abstract Classes
 * Author: [Your Name]
 * Description: Implement Strategy pattern for message formatting
 */
// ===== Interfaces =====
interface Notifiable {
    void send();
    default void retry() {
        System.out.println("Retrying notification...");
    }
}

interface Trackable {
    String getDeliveryStatus();
}

interface Formattable {
    String format();
}

// ===== Abstract Base Notification =====
abstract class BaseNotification implements Notifiable, Trackable, Formattable {
    protected String message;
    protected String recipient;
    protected String priority; // HIGH, MEDIUM, LOW

    public BaseNotification(String message, String recipient, String priority) {
        this.message = message;
        this.recipient = recipient;
        this.priority = priority;
    }

    public void send() {
        System.out.println("Sending to " + recipient + " with priority " + priority + ": " + format());
    }

    public String getDeliveryStatus() {
        return "Delivered to " + recipient;
    }

    public void retry() {
        System.out.println("Retrying delivery to " + recipient);
    }
}

// ===== Concrete Notifications =====
class EmailNotification extends BaseNotification {
    public EmailNotification(String msg, String to, String priority) {
        super(msg, to, priority);
    }
    public String format() { return "[Email] " + message; }
}

class SMSNotification extends BaseNotification {
    public SMSNotification(String msg, String to, String priority) {
        super(msg, to, priority);
    }
    public String format() { return "[SMS] " + message; }
}

class PushNotification extends BaseNotification {
    public PushNotification(String msg, String to, String priority) {
        super(msg, to, priority);
    }
    public String format() { return "[Push] " + message; }
}

// ===== Message Formatter =====
interface MessageFormatter {
    String formatMessage(String message);
}

class HTMLFormatter implements MessageFormatter {
    public String formatMessage(String message) { return "<html>" + message + "</html>"; }
}

class PlainFormatter implements MessageFormatter {
    public String formatMessage(String message) { return message; }
}

// ===== Notification Manager =====
class NotificationManager {
    private BaseNotification[] notifications;

    public NotificationManager(BaseNotification[] notifications) {
        this.notifications = notifications;
    }

    public void sendAll() {
        for (BaseNotification n : notifications) {
            n.send();
            System.out.println(n.getDeliveryStatus());
        }
    }
}

// ===== Main Program =====
public class Main {
    public static void main(String[] args) {
        BaseNotification[] notifs = {
            new EmailNotification("Meeting at 10AM", "alice@example.com", "HIGH"),
            new SMSNotification("Lunch break", "555-1234", "MEDIUM"),
            new PushNotification("New message!", "Bob's phone", "LOW")
        };

        NotificationManager manager = new NotificationManager(notifs);
        manager.sendAll();
    }
}
`;

function readFile(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { console.error(e); process.exit(1); } }
function extractSolution(src, id) {
  const idx = src.indexOf("id: '" + id + "'");
  if (idx === -1) return null;
  const rest = src.slice(idx);
  const m = rest.match(/solutionCode:\s*`([\s\S]*?)`/);
  return m ? m[1] : null;
}
function removeComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); }
function normalizeCode(s) { return removeComments(s).replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim(); }
function stripWhitespace(s) { return removeComments(s).replace(/\s+/g, ''); }
function levenshtein(a, b) { const al = a.length, bl = b.length; if (al === 0) return bl; if (bl === 0) return al; const v0 = []; for (let i = 0; i <= bl; i++) v0[i] = i; let v1 = new Array(bl + 1); for (let i = 0; i < al; i++) { v1[0] = i + 1; for (let j = 0; j < bl; j++) { const cost = a[i] === b[j] ? 0 : 1; v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost); } for (let k = 0; k <= bl; k++) v0[k] = v1[k]; } return v1[bl]; }

const src = readFile(filePath);
const canonical = extractSolution(src, projectId);
if (!canonical) { console.log('No canonical solution found for', projectId); process.exit(2); }

const userNorm = normalizeCode(submitted);
const canonNorm = normalizeCode(canonical);
const userNo = stripWhitespace(userNorm).toLowerCase();
const canonNo = stripWhitespace(canonNorm).toLowerCase();

console.log('Normalized exact equality:', userNorm === canonNorm);
console.log('Whitespace-stripped equality:', userNo === canonNo);
const maxLen = Math.max(userNo.length, canonNo.length) || 1;
const dist = levenshtein(userNo, canonNo);
const sim = 1 - dist / maxLen;
console.log('Levenshtein distance:', dist, 'Similarity:', sim.toFixed(4));
if (userNorm === canonNorm || userNo === canonNo || sim >= 0.95) console.log('MATCH — submission should be accepted by project validator'); else console.log('NO MATCH — will be graded by flexible checks');

process.exit(0);
