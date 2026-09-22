import pytest
from bs4 import BeautifulSoup
import os

@pytest.fixture
def soup():
    path = 'index.html'
    assert os.path.exists(path), "src/index.html não encontrado"
    with open(path, 'r', encoding='utf-8') as f:
        return BeautifulSoup(f, 'html.parser')

def test_html5_semantic_and_tailwind(soup):
    # Verifica se o arquivo é um documento HTML5
    assert soup.find('meta', {'charset': 'UTF-8'})
    # Verifica se o Tailwind CSS está carregado (via CDN ou classe comum)
    html_content = str(soup)
    assert 'tailwind' in html_content.lower(), "Tailwind CSS não identificado"

def test_sections_existence(soup):
    # Verifica se as seções principais existem usando IDs ou classes semânticas
    ids = ['header', 'menu', 'drinks', 'cart-drawer', 'checkout-form']
    for id_name in ids:
        assert soup.find(id=id_name) is not None, f"Seção '{id_name}' faltando no DOM"

def test_portuguese_localization(soup):
    # Verifica se a tag lang está em pt-BR
    html_tag = soup.find('html')
    assert html_tag.get('lang') == 'pt-BR', "A linguagem do documento deve ser pt-BR"

def test_responsiveness_meta(soup):
    # Verifica a meta tag de viewport para responsividade
    viewport = soup.find('meta', {'name': 'viewport'})
    assert viewport is not None
    assert 'width=device-width' in viewport.get('content', '')
