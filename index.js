const fs = require('fs-extra');
const login = require('facebook-chat-api');
const log = require('./utils/log');

// Đọc cookie từ environment (GitHub Actions) hoặc file
let appState;
if (process.env.APPSTATE) {
    try {
        appState = JSON.parse(process.env.APPSTATE);
        log('✅ Đã đọc cookie từ GitHub Secrets', '✅');
    } catch (e) {
        log('❌ Lỗi đọc cookie từ env: ' + e.message, '❌');
        process.exit(1);
    }
} else if (fs.existsSync('appstate.json')) {
    appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));
    log('✅ Đã đọc cookie từ file appstate.json', '✅');
} else {
    log('❌ Không tìm thấy cookie bot!', '❌');
    process.exit(1);
}

// Đăng nhập Facebook
login({ appState: appState }, (err, api) => {
    if (err) {
        log('❌ Lỗi đăng nhập: ' + err.message, '❌');
        process.exit(1);
    }
    
    log('✅ Bot đã đăng nhập thành công!', '✅');
    log('🤖 Bot đang hoạt động...', '🤖');
    
    // Lắng nghe tin nhắn
    api.listen((err, message) => {
        if (err) {
            log('❌ Lỗi listen: ' + err.message, '❌');
            return;
        }
        
        // Xử lý tin nhắn ở đây
        if (message.body) {
            const msg = message.body.toLowerCase();
            
            // Lệnh .help
            if (msg === '.help') {
                api.sendMessage(
                    '🤖 Bot đang hoạt động!\n\n📋 Danh sách lệnh:\n.help - Xem hướng dẫn\n.ping - Kiểm tra bot',
                    message.threadID
                );
            }
            
            // Lệnh .ping
            if (msg === '.ping') {
                api.sendMessage('🏓 Pong!', message.threadID);
            }
        }
    });
});

// Bắt lỗi để GitHub Actions báo lỗi
process.on('uncaughtException', (err) => {
    log('❌ Lỗi không xử lý được: ' + err.message, '❌');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    log('❌ Promise rejection: ' + reason, '❌');
    process.exit(1);
});

log('🚀 Bot đang khởi động...', '🚀');
