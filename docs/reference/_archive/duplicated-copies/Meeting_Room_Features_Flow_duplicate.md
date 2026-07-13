> **⚠️ Archived duplicate.** This file was previously named `Meeting Room Features Flow.md` in `source-inputs/` and is byte-for-byte identical to the canonical flow document. The canonical, authoritative copy is [`../../source-inputs/Meeting_Room_Features_Flow_v3_CANONICAL.md`](../../source-inputs/Meeting_Room_Features_Flow_v3_CANONICAL.md) — that is the one every canonical doc cites (see [Founder_Decision_Log](../../../product/Founder_Decision_Log.md), [MeetingRoom_Product_Spec](../../../product/MeetingRoom_Product_Spec.md)). Kept here only to avoid two near-identically-named files in `source-inputs/`; no content was lost. Do not edit this copy — edit the canonical one.

---

This version is much cleaner. I would still simplify it further by **removing repeated workflows** (Assistance, IT Support, Power Bank, Other Service all follow the same pattern). The document below keeps every business requirement but presents it in a format that a product manager, architect, or developer can quickly understand.

---

# **Meeting Room Features Flow**

## **1\. Dashboard**

### **Meeting Room Booking**

Support the following booking types:

#### **Member Booking**

* Member ID  
* Member Name  
* Mobile Number (Optional)  
* Number of Guests (Optional)  
* Select Available Meeting Room

#### **Guest / Non-Member Booking**

* Guest Name  
* Mobile Number  
* Number of Guests (Optional)  
* Select Available Meeting Room

#### **Additional Booking Features**

* Recurring Meeting Booking  
* Modify / Reschedule Booking  
* Cancel Booking (Configurable)  
* Future bookings allowed up to 6 months

---

# **2\. Before Meeting Starts**

### **10 Minutes Before Meeting Start**

**Meeting Room Status:** Reserved

### **LUXEGENIE displays:**

* Welcome to Quorum  
* Reserved for: Guest Name  
* Meeting Duration / Slot  
* Meeting Room Number  
* Start Meeting button

---

# **3\. Meeting Start**

At the scheduled meeting time:

* Dashboard status changes from **Available → Reserved**  
* When guest taps **Start Meeting** on LUXEGENIE:  
  * Dashboard status changes from **Reserved → In Use**

### **LUXEGENIE Home Screen**

* Welcome, Guest Name  
* Tap for Wi-Fi  
* Tap for Assistance  
* F\&B Order  
* Services  
* Explore  
* Bill Request  
* Review Quorum on Google  
* Meeting Room Number

---

# **4\. Meeting Ending**

## **Scenario: Back-to-Back Meeting**

When another meeting is scheduled immediately after the current meeting:

### **Dashboard**

* Display **"Ending Soon"** 10 minutes before meeting ends.  
* Send notification to staff smartwatch.

### **LUXEGENIE**

Display:

* Extend Meeting  
* Confirm  
* Cancel  
* Home

### **Business Rule**

If no action is taken by the guest:

* Meeting will **NOT** end automatically.  
* Dashboard will notify Management that the meeting has ended.  
* Management can:  
  * End Meeting  
  * Extend Meeting  
  * Generate Bill

---

# **5\. Feature Flows**

---

## **5.1 Tap for Wi-Fi**

### **LUXEGENIE**

Display:

* Wi-Fi QR Code  
* Username  
* Password

**Dashboard:** No action required.

---

## **5.2 Standard Service Request Flow**

The following services use the same workflow:

* Tap for Assistance  
* IT Support  
* Power Bank  
* Other Service

### **LUXEGENIE Flow**

1. Guest selects a service.  
2. Display confirmation message.  
3. Allow cancellation within 3 seconds.  
4. If cancelled, return to Home.  
5. If not cancelled:  
   * Display "Request Sent"  
   * Show Home button  
   * Auto-return to Home after 10 seconds.

### **Dashboard Flow**

Display:

* Service Requested  
* Accept Button

If unattended for more than 1 minute:

* Bell notification  
* Accept button animation

When staff clicks **Accept**:

* Request closes.  
* No change required on LUXEGENIE.

---

## **5.3 F\&B Ordering**

### **LUXEGENIE**

Display:

* Veg / Non-Veg / All filters  
* Food Categories  
* Menu Items  
* Cart

Guest places order.

Display:

Your order will be served shortly.

Auto-return to Home after 10 seconds.

### **Dashboard**

Display:

* F\&B Order Requested  
* View Order  
* Order Punched

Staff can:

* Add items  
* Remove items  
* Modify quantity  
* Add verbal orders

If unattended for more than 1 minute:

* Bell notification  
* Accept button animation

When staff clicks **Order Punched**:

* Request closes.

---

## **5.4 Services**

Available services:

* IT Support  
* Power Bank  
* Extend Meeting  
* Other Service

### **Extend Meeting**

Guest selects extension duration.

Display:

* Extend Meeting  
* Duration (-30 to \+240 minutes)  
* Confirm  
* Cancel

If confirmed:

Display:

Meeting extension request in process. Management will contact you shortly.

Dashboard displays:

* Meeting Extension Requested  
* Requested Duration  
* Seen Button

When staff clicks **Seen**, request closes.

### **Future Enhancement**

Allow LUXEGENIE to:

* Extend booking directly  
* Block calendar  
* Update Meeting Room Management Software automatically

---

## **5.5 Explore**

Display:

* Upcoming Events  
* 2–3 Featured Events

**Dashboard:** No action required.

---

## **5.6 Bill Request**

### **LUXEGENIE**

Guest selects payment method.

Available options:

* Q Pay (Members Only)  
* Scan to Pay  
* Payment Link  
* Card  
* Cash

After selection:

* Bill Request sent to Dashboard  
* Guest is asked to rate:  
  * Quorum Experience  
  * LUXEGENIE Experience

### **Dashboard**

Staff enters bill amount (retrieved from POS / Touche).

### **LUXEGENIE displays**

#### **Q Pay**

* Total Amount  
* Please wait to sign the bill

#### **Scan to Pay**

* Total Amount  
* QR Code

#### **Payment Link**

* Total Amount  
* Payment link will be sent shortly

#### **Card**

* Total Amount  
* Your host is on the way

#### **Cash**

* Total Amount  
* Your host is on the way

### **Meeting Completion**

After payment confirmation by staff:

* Meeting ends.  
* Dashboard status changes to **Available**.

---

# **6\. Manual Meeting Closure**

If the guest leaves without:

* Requesting the bill  
* Ending the meeting

Management should be able to:

* End Meeting  
* Generate Bill  
* Confirm Payment  
* Mark Meeting Room as Available

through the Dashboard.

---

# **7\. Common Business Rules**

* Meeting room status changes to **Reserved** at the scheduled meeting start time.  
* Meeting status changes to **In Use** only after the guest taps **Start Meeting**.  
* Every service request can be cancelled within **3 seconds**.  
* All request confirmation screens automatically return to the Home screen after **10 seconds**.  
* Any unattended request for more than **1 minute** triggers:  
  * Bell notification  
  * Animated call-to-action on the Dashboard.  
* Dashboard always has the authority to:  
  * End meetings  
  * Extend meetings  
  * Generate bills  
  * Confirm payments  
  * Close requests

---

One suggestion I'd make before handing this to the engineering team: add a final section titled **"Meeting Room State Machine"** with the status flow:

**Available → Reserved → In Use → Ending Soon → Billing → Available**

This single diagram (or even just the arrow sequence) will save the developers a lot of time because almost every workflow in the system depends on the meeting room's current state.

