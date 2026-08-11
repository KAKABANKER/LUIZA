const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
};

function serveFile(filePath, res) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log('Erro ao ler arquivo:', filePath);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('500 - Erro interno do servidor');
            return;
        }

        console.log('Servindo:', filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    console.log(req.method, req.url);

    let filePath = req.url.split('?')[0];

    // Rotas da API
    if (req.url.startsWith('/api/produtos')) {
        try {
            const produtos = JSON.parse(fs.readFileSync('./produtos.json', 'utf8'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(produtos));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro ao carregar produtos' }));
        }
        return;
    }

    if (req.url.startsWith('/api/carrinho')) {
        if (req.method === 'GET') {
            try {
                const carrinho = JSON.parse(fs.readFileSync('./carrinho.json', 'utf8'));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(carrinho));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Erro ao carregar carrinho' }));
            }
            return;
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    let carrinho = [];
                    try {
                        carrinho = JSON.parse(fs.readFileSync('./carrinho.json', 'utf8'));
                    } catch (e) {
                        carrinho = [];
                    }
                    carrinho.push(data);
                    fs.writeFileSync('./carrinho.json', JSON.stringify(carrinho, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Produto adicionado ao carrinho' }));
                } catch (err) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Dados invalidos' }));
                }
            });
            return;
        }

        if (req.method === 'DELETE') {
            fs.writeFileSync('./carrinho.json', JSON.stringify([]));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Carrinho esvaziado' }));
            return;
        }
    }

    // Roteamento das paginas
    if (filePath === '/') {
        filePath = '/index.html';
    }

    if (filePath === '/admin') {
        filePath = '/admin/index.html';
    }

    if (filePath === '/produto') {
        filePath = '/produto.html';
    }

    let fullPath = path.join(__dirname, 'public', filePath);

    fs.stat(fullPath, (err, stats) => {
        if (err) {
            console.log('Arquivo nao encontrado:', fullPath);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>404 - Pagina nao encontrada</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 60px 20px; background: #f0f3f4; }
                        h1 { font-size: 72px; color: #0086ff; margin: 0; }
                        p { font-size: 18px; color: #697277; }
                        a { color: #0086ff; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <h1>404</h1>
                    <p>Ops! A pagina que voce procurou nao foi encontrada.</p>
                    <p><a href="/">Voltar para a pagina inicial</a></p>
                </body>
                </html>
            `);
            return;
        }

        if (stats.isDirectory()) {
            fullPath = path.join(fullPath, 'index.html');
            fs.stat(fullPath, (err2) => {
                if (err2) {
                    res.writeHead(403, { 'Content-Type': 'text/html' });
                    res.end('403 - Acesso negado');
                    return;
                }
                serveFile(fullPath, res);
            });
            return;
        }

        serveFile(fullPath, res);
    });
});

server.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:' + PORT);
    console.log('Pressione Ctrl+C para parar');
});