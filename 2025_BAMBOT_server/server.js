const { SerialPort } = require('serialport');
const { WebSocketServer } = require('ws');
const http = require('http');

// 【要修正！】ESP32受信機が接続されているPCのシリアルポート名
const PORT_NAME = 'COM6'; // ⚠️ 環境に合わせて変更してください

const BAUD_RATE = 115200;
const WS_PORT = 8080; // WebSocketサーバーが使用するポート

// 1. WebSocket サーバーのセットアップ
const server = http.createServer();
const wss = new WebSocketServer({ server });

let serialPortInstance = null; // シリアルポートインスタンスを保持するための変数

wss.on('connection', function connection(ws) {
    console.log('Reactクライアントが接続しました');
    
    ws.on('message', function incoming(message) {
        try {
            const data = JSON.parse(message.toString());
            
            if (data.command) {
                console.log(`[WS受信 - コマンド] ${data.command}`);
                
                // 🚨 変更点: コマンド文字列をチェック
                const commandToSend = data.command.toLowerCase(); // Reactから受け取ったコマンドを小文字化
                
                if (commandToSend === 'cut_on' || commandToSend === 'cut_off') {
                    if (serialPortInstance && serialPortInstance.isOpen) {
                        // ESP32のシリアル入力処理に合わせて改行コード(\n)を付与
                        serialPortInstance.write(`${commandToSend}\n`, (err) => {
                            if (err) {
                                console.error('シリアル送信エラー:', err.message);
                            } else {
                                console.log(`[シリアル送信 - コマンド] ${commandToSend} をESP32へ送信`);
                            }
                        });
                    } else {
                        console.warn('シリアルポートがオープンされていません。コマンド送信をスキップしました。');
                    }
                } else {
                    console.warn(`不明なコマンドを受信: ${data.command}`);
                }
            }
        } catch (e) {
            console.error('WebSocketメッセージのJSON解析エラー:', e);
        }
    });
});

server.listen(WS_PORT, () => {
    console.log(`WebSocketサーバーはポート ${WS_PORT} で実行中...`);
    console.log('ESP32からのデータ待機中...');
});

// 2. シリアルポートのセットアップ (変更なし)
try {
    const port = new SerialPort({ 
        path: PORT_NAME, 
        baudRate: BAUD_RATE 
    });
    
    serialPortInstance = port; 

    // ReadlineParser: GPSデータ（JSON）の受信
    const { ReadlineParser } = require('@serialport/parser-readline');
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', data => {
        const jsonString = data.toString().trim();
        console.log(`[シリアル受信 - GPS] ${jsonString}`);

        // 受信データをWebSocket経由で全クライアントにブロードキャスト
        wss.clients.forEach(function each(client) {
            if (client.readyState === require('ws').OPEN) {
                client.send(jsonString);
            }
        });
    });

    port.on('open', () => console.log(`シリアルポート ${PORT_NAME} をオープンしました`));
    port.on('error', (err) => console.error('シリアルポートエラー:', err.message));

} catch (e) {
    console.error(`シリアルポート ${PORT_NAME} の初期化に失敗しました。ポート名を確認してください。`, e);
}