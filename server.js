const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// Configurações do MySQL
const dbConfig = {
    host: process.env.MYSQL_HOST || 'db',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'fullcycle'
};

// Criar pool de conexões
let pool;

async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        
        // Criar tabela se não existir
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS people (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await pool.execute(createTableQuery);
        
        // Verificar se temos dados iniciais
        const [rows] = await pool.execute('SELECT COUNT(*) as count FROM people');
        if (rows[0].count === 0) {
            const names = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'];
            for (const name of names) {
                await pool.execute('INSERT INTO people (name) VALUES (?)', [name]);
            }
            console.log('Dados iniciais inseridos no banco de dados');
        }
        
        console.log('Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
        // Tentar reconectar após 5 segundos
        setTimeout(initDatabase, 5000);
    }
}

// Middleware para adicionar nome automaticamente na rota principal
app.use(async (req, res, next) => {
    if (req.path === '/' && req.method === 'GET') {
        try {
            // Gerar um nome aleatório
            const names = [
                'Alice', 'Bob', 'Charlie', 'Diana', 'Eduardo', 
                'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia'
            ];
            const randomName = names[Math.floor(Math.random() * names.length)];
            
            // Adicionar ao banco de dados
            await pool.execute('INSERT INTO people (name) VALUES (?)', [randomName]);
        } catch (error) {
            console.error('Erro ao inserir nome:', error);
        }
    }
    next();
});

// Rota principal
app.get('/', async (req, res) => {
    try {
        // Buscar todos os nomes do banco de dados
        const [rows] = await pool.execute('SELECT name FROM people ORDER BY created_at DESC');
        
        // Gerar HTML com a lista de nomes
        let namesList = '<ul>';
        rows.forEach(person => {
            namesList += `<li>${person.name}</li>`;
        });
        namesList += '</ul>';
        
        // Enviar resposta
        res.send(`
            <h1>Full Cycle Rocks!</h1>
            ${namesList}
            <p><small>Total de ${rows.length} nomes cadastrados</small></p>
        `);
    } catch (error) {
        console.error('Erro ao buscar nomes:', error);
        res.status(500).send('<h1>Erro ao conectar com o banco de dados</h1>');
    }
});

// Rota de saúde para verificar se a aplicação está funcionando
app.get('/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.status(200).json({ status: 'healthy' });
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Inicializar servidor
async function startServer() {
    await initDatabase();
    
    app.listen(port, () => {
        console.log(`Aplicação Node.js rodando na porta ${port}`);
        console.log(`Acesse: http://localhost:8080`);
    });
}

startServer().catch(console.error);