const express = require('express');
const app = express();

app.use(express.json());


// =========================
// FUNÇÃO PARA GERAR ID SEGURO (PRODUTOS)
// =========================
function gerarNovoId(lista) {
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(item => item.id)) + 1;
}


// =========================
// ARRAY DE CATEGORIAS
// =========================
let categorias = [
    { nome: "Sushis" },
    { nome: "Temakis" },
    { nome: "Bebidas" },
    { nome: "Sobremesas" }
];


// =========================
// ARRAY DE PRODUTOS
// =========================
let produtos = [

    // SUSHIS
    { id: 1, categoria: "Sushis", nome: "Combinado Sushi", preco: 99.00 },
    { id: 2, categoria: "Sushis", nome: "Combinado Sushi Premium", preco: 115.00 },
    { id: 3, categoria: "Sushis", nome: "Combinado Hot", preco: 99.00 },
    { id: 4, categoria: "Sushis", nome: "Nigiri Variado (10 un)", preco: 45.00 },

    // TEMAKIS
    { id: 5, categoria: "Temakis", nome: "Temaki Filadélfia", preco: 28.00 },
    { id: 6, categoria: "Temakis", nome: "Temaki Salmão", preco: 25.00 },
    { id: 7, categoria: "Temakis", nome: "Temaki Camarão", preco: 32.00 },
    { id: 8, categoria: "Temakis", nome: "Temaki Hot", preco: 30.00 },

    // BEBIDAS
    { id: 9, categoria: "Bebidas", nome: "Refrigerante (350ml)", preco: 8.00 },
    { id: 10, categoria: "Bebidas", nome: "Água Mineral (500ml)", preco: 4.00 },
    { id: 11, categoria: "Bebidas", nome: "Cerveja Heineken (330ml)", preco: 14.00 },
    { id: 12, categoria: "Bebidas", nome: "Suco Natural (300ml)", preco: 12.00 },
    { id: 13, categoria: "Bebidas", nome: "Sakê Quente (150ml)", preco: 18.00 },
    { id: 14, categoria: "Bebidas", nome: "Chá Verde (300ml)", preco: 7.00 },

    // SOBREMESAS
    { id: 15, categoria: "Sobremesas", nome: "Mochi de Morango", preco: 12.00 },
    { id: 16, categoria: "Sobremesas", nome: "Mochi de Matchá", preco: 12.00 },
    { id: 17, categoria: "Sobremesas", nome: "Dorayaki", preco: 10.00 }
];


// =====================================================
// =================== PRODUTOS ========================
// =====================================================

// GET todos
app.get('/produtos', (req, res) => {
    res.json(produtos);
});

// GET por ID
app.get('/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json(produto);
});

// POST
app.post('/produtos', (req, res) => {
    const { nome, preco, categoria } = req.body;

    if (!nome || preco == null || !categoria) {
        return res.status(400).json({ error: "Nome, preço e categoria são obrigatórios" });
    }

    const categoriaExiste = categorias.find(c => c.nome === categoria);
    if (!categoriaExiste) {
        return res.status(400).json({ error: "Categoria não existe" });
    }

    const novoProduto = {
        id: gerarNovoId(produtos),
        nome,
        preco,
        categoria
    };

    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

// PUT por ID
app.put('/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    const { nome, preco, categoria } = req.body;

    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) {
        return res.status(404).json({ error: "Produto não encontrado" });
    }

    if (categoria) {
        const categoriaExiste = categorias.find(c => c.nome === categoria);
        if (!categoriaExiste) {
            return res.status(400).json({ error: "Categoria não existe" });
        }
    }

    produtos[index] = {
        ...produtos[index],
        nome: nome ?? produtos[index].nome,
        preco: preco ?? produtos[index].preco,
        categoria: categoria ?? produtos[index].categoria
    };

    res.json(produtos[index]);
});

// DELETE por ID
app.delete('/produtos/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = produtos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Produto não encontrado" });
    }

    const removido = produtos.splice(index, 1)[0];
    res.json({ mensagem: "Produto removido", produto: removido });
});


// =====================================================
// =================== CATEGORIAS (SÓ POR NOME) ========
// =====================================================

// GET todas
app.get('/categorias', (req, res) => {
    res.json(categorias);
});

// GET por NOME
app.get('/categorias/:nome', (req, res) => {
    const nome = req.params.nome.toLowerCase();

    const categoria = categorias.find(c =>
        c.nome.toLowerCase() === nome
    );

    if (!categoria) {
        return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json(categoria);
});

// POST
app.post('/categorias', (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ error: "Nome é obrigatório" });
    }

    categorias.push({ nome });
    res.status(201).json({ nome });
});

// PUT por NOME
app.put('/categorias/:nome', (req, res) => {
    const nome = req.params.nome.toLowerCase();
    const { novoNome } = req.body;

    const categoria = categorias.find(c =>
        c.nome.toLowerCase() === nome
    );

    if (!categoria) {
        return res.status(404).json({ error: "Categoria não encontrada" });
    }

    categoria.nome = novoNome ?? categoria.nome;

    res.json(categoria);
});

// DELETE por NOME
app.delete('/categorias/:nome', (req, res) => {
    const nome = req.params.nome.toLowerCase();

    const index = categorias.findIndex(c =>
        c.nome.toLowerCase() === nome
    );

    if (index === -1) {
        return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const removida = categorias.splice(index, 1)[0];

    // Remove produtos da categoria
    produtos = produtos.filter(p =>
        p.categoria.toLowerCase() !== nome
    );

    res.json({ mensagem: "Categoria removida", categoria: removida });
});


// =====================================================
// FILTRAR PRODUTOS POR NOME DA CATEGORIA
// =====================================================

app.get('/produtos/categoria/:nome', (req, res) => {
    const nome = req.params.nome.toLowerCase();

    const filtrados = produtos.filter(p =>
        p.categoria.toLowerCase() === nome
    );

    res.json(filtrados);
});


// =========================
// INICIAR SERVIDOR
// =========================
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});