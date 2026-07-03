const { spawn } = require("child_process");
const fs = require("fs-extra");
const log = require("./utils/log");

// Hàm khởi động bot
const startBot = () => {
    log('🚀 BOT ĐANG KHỞI ĐỘNG...', '⚡');
    
    // Chạy file index.js (hoặc file chính của bot)
    const child = spawn("node", ["index.js"], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    // Lắng nghe khi bot tắt
    child.on("close", async (exitCode) => {
        log(`⚠️ Bot dừng với mã: ${exitCode}`, '⚠️');
        
        if (exitCode === 1) {
            // Lỗi thông thường -> restart ngay
            log('🔄 ĐANG RESTART BOT...', '🔄');
            startBot();
        } else if (exitCode >= 200 && exitCode <= 299) {
            // Lỗi cần đợi
            const delay = (exitCode - 200) * 1000;
            log(`⏳ ĐỢI ${delay/1000} GIÂY TRƯỚC KHI RESTART...`, '⏳');
            await new Promise(resolve => setTimeout(resolve, delay));
            startBot();
        } else if (exitCode === 0) {
            // Bot tắt bình thường
            log('✅ BOT ĐÃ TẮT AN TOÀN', '✅');
        } else {
            // Lỗi khác
            log(`❌ BOT GẶP LỖI (${exitCode}), RESTART...`, '❌');
            startBot();
        }
    });

    // Bắt lỗi crash
    child.on("error", (err) => {
        log(`❌ LỖI SPAWN: ${err.message}`, '❌');
        setTimeout(startBot, 5000);
    });
};

// Khởi động bot lần đầu
startBot();

// Bắt lỗi toàn cục
process.on('uncaughtException', (err) => {
    console.error('❌ LỖI CHƯA XỬ LÝ:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ PROMISE REJECTION:', reason);
});
