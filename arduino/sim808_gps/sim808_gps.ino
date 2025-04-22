#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Dùng UART1 của ESP32 (TX = GPIO 17, RX = GPIO 16)
#define RXD1 16
#define TXD1 17

// Địa chỉ I2C mặc định của LCD thường là 0x27 hoặc 0x3F
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Serial.begin(9600);  // Serial Monitor
  Serial1.begin(9600, SERIAL_8N1, RXD1, TXD1); // UART1 giao tiếp với SIM808

  // Khởi tạo LCD
  Wire.begin(21, 22); // SDA = 21, SCL = 22
  lcd.init();         // Khởi tạo màn hình LCD
  lcd.backlight();    // Bật đèn nền

  // Ghi dòng chữ khởi tạo
  lcd.setCursor(0, 0);
  lcd.print("Khoi dong GPS...");

  // Bật GPS
  sendATCommand("AT+CGNSPWR=1");
  delay(1000);

  // Yêu cầu thông tin GPS
  sendATCommand("AT+CGNSINF");
  delay(1000);

  // Cài đặt chu kỳ báo cáo thông tin GPS (mỗi 10 giây)
  sendATCommand("AT+CGNSURC=10");
  delay(1000);

  // Hiển thị đã sẵn sàng
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("GPS san sang!");
}

void loop() {
  // Gửi lệnh lấy thông tin GPS mỗi 10 giây
  sendATCommand("AT+CGNSINF");

  // Bạn có thể cập nhật lên LCD nếu muốn
  lcd.setCursor(0, 1);
  lcd.print("Lay vi tri...   ");

  delay(10000);
}

void sendATCommand(String command) {
  Serial1.println(command);
  delay(500);
  String response = "";

  while (Serial1.available()) {
    char c = Serial1.read();
    Serial.print(c); // In ra màn hình Serial Monitor
    response += c;
  }

  // Ví dụ: hiển thị đoạn thông tin GPS lên LCD (giới hạn 16 ký tự)
  if (response.length() > 0) {
    lcd.setCursor(0, 1);
    lcd.print(response.substring(0, 16)); // Chỉ hiển thị 16 ký tự đầu
  }
}
