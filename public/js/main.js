// Funcoes globais
function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

function formatPrice(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function gerarEstrelas(quantidade) {
    let html = '';
    for (let i = 0; i < quantidade; i++) {
        html += '<i class="fas fa-star"></i>';
    }
    return html;
}

// Busca global
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.location.href = '/busca.html?q=' + encodeURIComponent(this.value);
            }
        });
    }

    // Menu categorias
    document.querySelectorAll('.menu-categorias li[data-categoria]').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = '/categoria.html?c=' + encodeURIComponent(this.dataset.categoria);
        });
    });

    // Atalhos
    document.querySelectorAll('.atalho[data-categoria]').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = '/categoria.html?c=' + encodeURIComponent(this.dataset.categoria);
        });
    });

    console.log('Magalu - Site carregado com sucesso!');
});