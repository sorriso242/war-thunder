// 1. CONFIGURAÇÃO THREE.JS
const cena = new THREE.Scene();
cena.fog = new THREE.FogExp2(0x2a3038, 0.007);
cena.background = new THREE.Color(0x3a424a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderizador.domElement);

const luzAmbiente = new THREE.AmbientLight(0x778899, 1.5); 
cena.add(luzAmbiente);

const luzSol = new THREE.DirectionalLight(0xffddaa, 1.2);
luzSol.position.set(50, 80, 30);
cena.add(luzSol);

const tamanhoMapa = 600;

const geoChao = new THREE.PlaneGeometry(tamanhoMapa / 2, tamanhoMapa);
const matChao = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
const chao = new THREE.Mesh(geoChao, matChao);
chao.rotation.x = -Math.PI / 2;
chao.position.set(-tamanhoMapa / 4, 0, 0);
cena.add(chao);

const geoAgua = new THREE.PlaneGeometry(tamanhoMapa / 2, tamanhoMapa);
const matAgua = new THREE.MeshStandardMaterial({ color: 0x004466, roughness: 0.2, metalness: 0.3 });
const agua = new THREE.Mesh(geoAgua, matAgua);
agua.rotation.x = -Math.PI / 2;
agua.position.set(tamanhoMapa / 4, -0.2, 0);
cena.add(agua);

const estruturasComColisao = [];

function adicionarEstrutura(mesh) {
    cena.add(mesh);
    const box = new THREE.Box3().setFromObject(mesh);
    estruturasComColisao.push({ mesh: mesh, box: box });
}

function gerarCidadeEmGuerra() {
    const matConcreto = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 });
    const matTijoloEscuro = new THREE.MeshStandardMaterial({ color: 0x3d3530, roughness: 0.9 });
    const matRuina = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.95 });
    const matFogo = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    const tamanhoBloco = 40;
    const larguraRua = 20;

    for (let x = -260; x <= -20; x += tamanhoBloco + larguraRua) {
        for (let z = -200; z <= 200; z += tamanhoBloco + larguraRua) {
            if (Math.abs(x + 140) < 30 && Math.abs(z) < 30) continue;

            const tipoConstrucao = Math.random();

            if (tipoConstrucao < 0.45) {
                const alt = 25 + Math.random() * 50;
                const larg = 16 + Math.random() * 12;
                const prof = 16 + Math.random() * 12;

                const predio = new THREE.Mesh(new THREE.BoxGeometry(larg, alt, prof), matConcreto);
                predio.position.set(x + (Math.random() - 0.5) * 4, alt / 2, z + (Math.random() - 0.5) * 4);
                adicionarEstrutura(predio);

            } else if (tipoConstrucao < 0.85) {
                const larg = 18 + Math.random() * 8;
                const prof = 18 + Math.random() * 8;
                const altBase = 8 + Math.random() * 12;

                const base = new THREE.Mesh(new THREE.BoxGeometry(larg, altBase, prof), matRuina);
                base.position.set(x, altBase / 2, z);
                adicionarEstrutura(base);

                const numPedacos = 2 + Math.floor(Math.random() * 3);
                for (let k = 0; k < numPedacos; k++) {
                    const altPedaco = 5 + Math.random() * 12;
                    const pedaco = new THREE.Mesh(new THREE.BoxGeometry(larg * 0.35, altPedaco, prof * 0.35), matTijoloEscuro);
                    pedaco.position.set(
                        x + (Math.random() - 0.5) * (larg * 0.5),
                        altBase + altPedaco / 2,
                        z + (Math.random() - 0.5) * (prof * 0.5)
                    );
                    adicionarEstrutura(pedaco);
                }

                if (Math.random() > 0.5) {
                    const chama = new THREE.Mesh(new THREE.SphereGeometry(1.8 + Math.random() * 1.5, 8, 8), matFogo);
                    chama.position.set(x, altBase + 1.2, z);
                    cena.add(chama);
                }
            } else {
                const numEntulhos = 3 + Math.floor(Math.random() * 3);
                for (let e = 0; e < numEntulhos; e++) {
                    const tam = 3 + Math.random() * 3;
                    const entulho = new THREE.Mesh(new THREE.BoxGeometry(tam, tam, tam), matRuina);
                    entulho.position.set(
                        x + (Math.random() - 0.5) * 16,
                        tam / 2,
                        z + (Math.random() - 0.5) * 16
                    );
                    entulho.rotation.set(Math.random(), Math.random(), Math.random());
                    adicionarEstrutura(entulho);
                }
            }
        }
    }
}
gerarCidadeEmGuerra();

// 2. MODELOS 3D
function criarModeloTanque() {
    const g = new THREE.Group();
    const corMilitar = new THREE.MeshStandardMaterial({ color: 0x3b412d });

    const chassi = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 4.2), corMilitar);
    chassi.position.y = 0.55;
    g.add(chassi);

    const torreG = new THREE.Group();
    torreG.name = "torre";
    torreG.position.set(0, 1.3, 0);
    g.add(torreG);
    torreG.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.85, 2.0), corMilitar));

    // Canhão Principal
    const geoCanhao = new THREE.CylinderGeometry(0.12, 0.16, 2.8);
    geoCanhao.translate(0, 1.4, 0);
    const canhaoMesh = new THREE.Mesh(geoCanhao, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    canhaoMesh.name = "canhao";
    canhaoMesh.rotation.x = -Math.PI / 2;
    canhaoMesh.position.set(0, 0, -0.5);
    torreG.add(canhaoMesh);

    // Metralhadora Coaxial
    const geoMg = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
    geoMg.translate(0, 0.6, 0);
    const mgMesh = new THREE.Mesh(geoMg, new THREE.MeshStandardMaterial({ color: 0x111111 }));
    mgMesh.rotation.x = -Math.PI / 2;
    mgMesh.position.set(0.4, 0.1, -0.6);
    torreG.add(mgMesh);

    return { group: g, torre: torreG, canhao: canhaoMesh };
}

function criarModeloAviao() {
    const g = new THREE.Group();
    const matAviao = new THREE.MeshStandardMaterial({ color: 0x4a5568 });

    const corpoAviao = new THREE.Mesh(new THREE.ConeGeometry(0.9, 5.5, 8), matAviao);
    corpoAviao.rotation.x = -Math.PI / 2;
    g.add(corpoAviao);

    const asas = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.1, 1.3), matAviao);
    g.add(asas);

    const cauda = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.3, 1.1), matAviao);
    cauda.position.set(0, 0.65, 2.2);
    g.add(cauda);

    return { group: g };
}

function criarModeloNavio() {
    const g = new THREE.Group();
    const matCasco = new THREE.MeshStandardMaterial({ color: 0x2f3542, roughness: 0.5 });
    const matSuperestrutura = new THREE.MeshStandardMaterial({ color: 0x747d8c });
    const matCanhaoNaval = new THREE.MeshStandardMaterial({ color: 0x1e272e });

    const cascoBase = new THREE.Mesh(new THREE.BoxGeometry(6, 2.5, 18), matCasco);
    cascoBase.position.y = 0.8;
    g.add(cascoBase);

    const proa = new THREE.Mesh(new THREE.ConeGeometry(3, 5, 4), matCasco);
    proa.rotation.x = -Math.PI / 2;
    proa.rotation.y = Math.PI / 4;
    proa.position.set(0, 0.8, -11.5);
    g.add(proa);

    const ponte = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 6), matSuperestrutura);
    ponte.position.set(0, 3, 0);
    g.add(ponte);

    const chamine = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.5), matSuperestrutura);
    chamine.position.set(0, 5, 1);
    g.add(chamine);

    // Lançadores de Mísseis
    const matMisil = new THREE.MeshStandardMaterial({ color: 0xcc3333 });
    const lancadorEsq = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.2), matMisil);
    lancadorEsq.position.set(-2.2, 2.3, 2);
    g.add(lancadorEsq);

    const lancadorDir = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.2), matMisil);
    lancadorDir.position.set(2.2, 2.3, 2);
    g.add(lancadorDir);

    const torreNavalFrente = new THREE.Group();
    torreNavalFrente.name = "torreNavalFrente";
    torreNavalFrente.position.set(0, 2.3, -5.5);
    g.add(torreNavalFrente);
    torreNavalFrente.add(new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 3.5), matSuperestrutura));

    const canhaoN1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4), matCanhaoNaval);
    canhaoN1.rotation.x = -Math.PI / 2;
    canhaoN1.position.set(-0.7, 0.2, -2);
    torreNavalFrente.add(canhaoN1);

    const canhaoN2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4), matCanhaoNaval);
    canhaoN2.rotation.x = -Math.PI / 2;
    canhaoN2.position.set(0.7, 0.2, -2);
    torreNavalFrente.add(canhaoN2);

    return { group: g, torreNavalFrente: torreNavalFrente };
}

const tanqueObj = criarModeloTanque();
const tanque = tanqueObj.group;
const torre = tanqueObj.torre;
const canhao = tanqueObj.canhao;

const aviaoObj = criarModeloAviao();
const aviao = aviaoObj.group;

const navioObj = criarModeloNavio();
const navio = navioObj.group;
const torreNavalFrente = navioObj.torreNavalFrente;

// 3. MULTIPLAYER E REDE
let peer = null;
let conexaoPeer = null;
let conexoesAtivas = [];
let meuIdSocket = "local_" + Math.floor(Math.random() * 1000000);
const outrosJogadores = {}; 

// Servidores STUN + TURN públicos para forçar a conexão P2P no mesmo Wi-Fi
const CONFIG_PEER = {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelay',
                credential: 'openrelay'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelay',
                credential: 'openrelay'
            }
        ]
    }
};

function criarSalaOnline() {
    atualizarStatusUI("Gerando Sala...", "#ffcc00");
    if (peer) peer.destroy();

    peer = new Peer(CONFIG_PEER);

    peer.on('open', (id) => {
        meuIdSocket = id;
        document.getElementById('codigoSalaInput').value = id;
        atualizarStatusUI("Sala Criada! Código Gerado.", "#2ecc71");
    });

    peer.on('connection', (conn) => {
        conexoesAtivas.push(conn);
        configurarEventosConexao(conn);
    });

    peer.on('error', (err) => {
        console.error("Erro no PeerJS:", err);
        atualizarStatusUI("Erro ao criar sala. Tente de novo.", "#ff0000");
    });
}

function entrarNaSala() {
    const codigoSala = document.getElementById('codigoSalaInput').value.trim();
    if (!codigoSala) {
        alert("Cole o código gerado pelo seu amigo!");
        return;
    }

    atualizarStatusUI("Conectando...", "#ffcc00");
    if (peer) peer.destroy();

    peer = new Peer(CONFIG_PEER);

    peer.on('open', (id) => {
        meuIdSocket = id;
        conexaoPeer = peer.connect(codigoSala, { reliable: true });
        configurarEventosConexao(conexaoPeer);
    });

    peer.on('error', (err) => {
        console.error("Erro no PeerJS:", err);
        atualizarStatusUI("Erro de conexão.", "#ff0000");
    });
}
function entrarNaSala() {
    const codigoSala = document.getElementById('codigoSalaInput').value.trim();
    if (!codigoSala) {
        alert("Cole o código gerado pelo seu amigo!");
        return;
    }

    atualizarStatusUI("Conectando...", "#ffcc00");
    if (peer) peer.destroy();

    peer = new Peer(CONFIG_PEER);

    peer.on('open', (id) => {
        meuIdSocket = id;
        conexaoPeer = peer.connect(codigoSala, { reliable: true });
        configurarEventosConexao(conexaoPeer);
    });

    peer.on('error', (err) => {
        console.error("Erro no PeerJS:", err);
        atualizarStatusUI("Erro de conexão.", "#ff0000");
    });
}

function configurarEventosConexao(conn) {
    conn.on('open', () => {
        atualizarStatusUI("🌐 Conectado ao amigo!", "#2ecc71");
        enviarEstadoMultiplayer('spawn');
    });

    conn.on('data', (data) => {
        if (data && data.id && data.id !== meuIdSocket) {
            processarDadosMultiplayer(data);
        }
    });
}

function enviarEstadoMultiplayer(acao = 'posicao', dadosExtras = {}) {
    if (!veiculoAtual) return;

    const nomeJogador = document.getElementById('playerNameInput').value || 'Jogador';

    const estado = {
        id: meuIdSocket,
        nome: nomeJogador,
        tipo: tipoVeiculo,
        acao: acao,
        pos: { x: veiculoAtual.position.x, y: veiculoAtual.position.y, z: veiculoAtual.position.z },
        rot: { x: veiculoAtual.rotation.x, y: veiculoAtual.rotation.y, z: veiculoAtual.rotation.z },
        torreRotY: (tipoVeiculo === 'tanque') ? torre.rotation.y : (tipoVeiculo === 'navio' ? torreNavalFrente.rotation.y : 0),
        canhaoRotX: (tipoVeiculo === 'tanque') ? canhao.rotation.x : 0,
        ...dadosExtras
    };

    if (conexaoPeer && conexaoPeer.open) conexaoPeer.send(estado);
    conexoesAtivas.forEach(c => { if (c.open) c.send(estado); });
}

function criar3DTextoLabel(texto) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'Bold 22px sans-serif';
    ctx.fillStyle = '#ffcc00';
    ctx.textAlign = 'center';
    ctx.fillText(texto, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 2.5, 1);
    return sprite;
}

function processarDadosMultiplayer(data) {
    if (data.acao === 'tomouDano' && data.alvoId === meuIdSocket) {
        receberDano(data.dano || 25);
        return;
    }

    if (data.acao === 'atirar') {
        criarTiroInimigoOuOutro(data);
        return;
    }

    if (data.acao === 'bomba') {
        criarBombaInimigoOuOutro(data);
        return;
    }

    if (!outrosJogadores[data.id]) {
        let objRet;
        if (data.tipo === 'tanque') objRet = criarModeloTanque();
        else if (data.tipo === 'aviao') objRet = criarModeloAviao();
        else if (data.tipo === 'navio') objRet = criarModeloNavio();

        if (objRet) {
            const meshGroup = objRet.group;
            const label = criar3DTextoLabel(data.nome || 'Inimigo');
            cena.add(meshGroup);
            cena.add(label);

            outrosJogadores[data.id] = {
                mesh: meshGroup,
                tipo: data.tipo,
                torre: objRet.torre || objRet.torreNavalFrente,
                canhao: objRet.canhao,
                label: label
            };
        }
    }

    const p = outrosJogadores[data.id];
    if (p) {
        p.mesh.position.set(data.pos.x, data.pos.y, data.pos.z);
        p.mesh.rotation.set(data.rot.x, data.rot.y, data.rot.z);

        if (p.torre) p.torre.rotation.y = data.torreRotY || 0;
        if (p.canhao) p.canhao.rotation.x = data.canhaoRotX || 0;

        if (p.label) {
            p.label.position.set(data.pos.x, data.pos.y + (data.tipo === 'aviao' ? 4 : 6), data.pos.z);
        }
    }
}

function criarTiroInimigoOuOutro(data) {
    const tamBala = data.tamBala || 0.22;
    const corBala = data.corBala || 0xff0055;
    
    const bala = new THREE.Mesh(
        new THREE.SphereGeometry(tamBala, 8, 8),
        new THREE.MeshBasicMaterial({ color: corBala })
    );
    bala.position.set(data.posTiro.x, data.posTiro.y, data.posTiro.z);
    cena.add(bala);

    tiros.push({ 
        mesh: bala, 
        direcao: new THREE.Vector3(data.dirTiro.x, data.dirTiro.y, data.dirTiro.z), 
        velocidade: data.velocidade || 2.8, 
        distancia: 0,
        raioDano: data.raioDano || 2.5
    });
}

function criarBombaInimigoOuOutro(data) {
    const bomba = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0xaa1111 })
    );
    bomba.position.set(data.posBomba.x, data.posBomba.y, data.posBomba.z);
    cena.add(bomba);

    bombas.push({
        mesh: bomba,
        vetorVelocidade: new THREE.Vector3(data.vetorVel.x, data.vetorVel.y, data.vetorVel.z),
        velocidadeQueda: 0.0
    });
}

// 4. CONTROLES E GAMEPLAY
let veiculoAtual = null;
let tipoVeiculo = '';
let armaSelecionada = 1;
let modoCameraMira = false;

function atualizarHUD() {
    const hud = document.getElementById('hud-jogo');
    const hudVeiculo = document.getElementById('hud-veiculo');
    const hudArma = document.getElementById('hud-arma');

    if (!hud) return;
    hud.style.display = 'block';

    if (tipoVeiculo === 'tanque') {
        hudVeiculo.innerText = "Veículo: Tanque de Guerra (Pressione 'C' para Mira)";
        hudArma.innerText = armaSelecionada === 1 ? "Arma [1]: Canhão 120mm (Pesado)" : "Arma [2]: Metralhadora 7.62mm (Rápida)";
    } else if (tipoVeiculo === 'navio') {
        hudVeiculo.innerText = "Veículo: Navio de Guerra";
        hudArma.innerText = armaSelecionada === 1 ? "Arma [1]: Bateria Naval (Canhão Duplo)" : "Arma [2]: Bateria de Mísseis (Rápida)";
    } else if (tipoVeiculo === 'aviao') {
        hudVeiculo.innerText = "Veículo: Caça de Combate";
        hudArma.innerText = "Armas: Metralhadora [Espaço] / Bomba [B]";
    }
}

let vidaJogador = 100;
let jogadorDestruido = false;

function receberDano(dano) {
    if (jogadorDestruido) return;
    vidaJogador -= dano;
    if (vidaJogador < 0) vidaJogador = 0;

    const hudHp = document.getElementById('hud-hp');
    if (hudHp) {
        hudHp.innerText = `Vida: ${vidaJogador}%`;
        hudHp.style.color = vidaJogador > 50 ? '#00ff00' : (vidaJogador > 20 ? '#ffff00' : '#ff0000');
    }

    if (vidaJogador <= 0) {
        jogadorDestruido = true;
        if (veiculoAtual) criarExplosao(veiculoAtual.position);
        alert("Seu veículo foi destruído!");
        
        setTimeout(() => {
            vidaJogador = 100;
            jogadorDestruido = false;
            if (hudHp) {
                hudHp.innerText = "Vida: 100%";
                hudHp.style.color = '#00ff00';
            }
            if (veiculoAtual) {
                veiculoAtual.position.set(
                    tipoVeiculo === 'navio' ? 120 : -100, 
                    0, 
                    (Math.random() - 0.5) * 50
                );
            }
        }, 3000);
    }
}

function selecionarVeiculo(tipo) {
    tipoVeiculo = tipo;
    document.getElementById('menu-principal').style.display = 'none';
    atualizarHUD();

    if (tipo === 'tanque') {
        veiculoAtual = tanque;
        cena.add(tanque);
        tanque.position.set(-100, 0, 0);
    } else if (tipo === 'aviao') {
        veiculoAtual = aviao;
        cena.add(aviao);
        resetarAviao();
    } else if (tipo === 'navio') {
        veiculoAtual = navio;
        cena.add(navio);
        navio.position.set(120, 0, 0);
    }

    enviarEstadoMultiplayer('spawn');
}

function resetarAviao() {
    aviao.position.set(-50, 50, 0);
    aviao.rotation.set(0, 0, 0);
}

function criarExplosao(posicao) {
    const explosao = new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xff4500, wireframe: true })
    );
    explosao.position.copy(posicao);
    cena.add(explosao);

    let escala = 1;
    const anim = setInterval(() => {
        escala += 0.35;
        explosao.scale.set(escala, escala, escala);
        if (escala > 4) {
            cena.remove(explosao);
            clearInterval(anim);
        }
    }, 30);
}

const inimigos = [];
const matInimigo = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
for (let i = 0; i < 12; i++) {
    const inimigo = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.6, 4.2), matInimigo);
    const eNaTerra = i < 8;
    inimigo.position.set(
        eNaTerra ? -30 - Math.random() * 200 : 40 + Math.random() * 180,
        eNaTerra ? 0.8 : 0.2,
        (Math.random() - 0.5) * 300
    );
    cena.add(inimigo);
    inimigos.push(inimigo);
}

const tiros = [];
const bombas = [];
let podeAtirar = true;
let podeSoltarBomba = true;

function atirar() {
    if (!podeAtirar || !veiculoAtual) return;

    let tamBala = 0.22;
    let corBala = 0xffcc00;
    let velTiro = 2.8;
    let raioDano = 2.5;
    let cadencia = 850;
    let danoArma = 20;

    const posicaoMundial = new THREE.Vector3();
    const direcaoMundial = new THREE.Vector3();

    if (tipoVeiculo === 'tanque') {
        canhao.getWorldPosition(posicaoMundial);
        direcaoMundial.set(0, 1, 0).applyQuaternion(canhao.getWorldQuaternion(new THREE.Quaternion()));

        if (armaSelecionada === 1) {
            tamBala = 0.35;
            corBala = 0xff5500;
            velTiro = 3.0;
            raioDano = 4.0;
            cadencia = 900;
            danoArma = 50;
        } else {
            tamBala = 0.12;
            corBala = 0xffff00;
            velTiro = 3.8;
            raioDano = 1.5;
            cadencia = 120;
            danoArma = 8;
        }

    } else if (tipoVeiculo === 'aviao') {
        aviao.getWorldPosition(posicaoMundial);
        direcaoMundial.set(0, 0, -1).applyQuaternion(aviao.getWorldQuaternion(new THREE.Quaternion()));
        tamBala = 0.15;
        corBala = 0xffcc00;
        velTiro = 3.2;
        raioDano = 2.0;
        cadencia = 120;
        danoArma = 12;

    } else if (tipoVeiculo === 'navio') {
        torreNavalFrente.getWorldPosition(posicaoMundial);
        posicaoMundial.y += 0.5;
        direcaoMundial.set(0, 0, -1).applyQuaternion(torreNavalFrente.getWorldQuaternion(new THREE.Quaternion()));

        if (armaSelecionada === 1) {
            tamBala = 0.5;
            corBala = 0xff2200;
            velTiro = 3.2;
            raioDano = 8.0;
            cadencia = 1100;
            danoArma = 60;
        } else {
            tamBala = 0.25;
            corBala = 0x00ffff;
            velTiro = 4.2;
            raioDano = 3.5;
            cadencia = 250;
            danoArma = 22;
        }
    }

    const bala = new THREE.Mesh(
        new THREE.SphereGeometry(tamBala, 8, 8),
        new THREE.MeshBasicMaterial({ color: corBala })
    );

    bala.position.copy(posicaoMundial);
    cena.add(bala);

    tiros.push({ 
        mesh: bala, 
        direcao: direcaoMundial, 
        velocidade: velTiro, 
        distancia: 0,
        raioDano: raioDano,
        dano: danoArma
    });

    enviarEstadoMultiplayer('atirar', {
        posTiro: { x: posicaoMundial.x, y: posicaoMundial.y, z: posicaoMundial.z },
        dirTiro: { x: direcaoMundial.x, y: direcaoMundial.y, z: direcaoMundial.z },
        tamBala: tamBala,
        corBala: corBala,
        velocidade: velTiro,
        raioDano: raioDano
    });

    podeAtirar = false;
    setTimeout(() => { podeAtirar = true; }, cadencia);
}

function soltarBomba() {
    if (!podeSoltarBomba || tipoVeiculo !== 'aviao') return;

    const bomba = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );

    const posicaoMundial = new THREE.Vector3();
    aviao.getWorldPosition(posicaoMundial);
    const velocidadeInercia = new THREE.Vector3(0, 0, -1).applyQuaternion(aviao.getWorldQuaternion(new THREE.Quaternion()));

    bomba.position.copy(posicaoMundial);
    bomba.position.y -= 1.2;
    cena.add(bomba);

    const vel = velocidadeInercia.clone().multiplyScalar(0.45);
    bombas.push({ mesh: bomba, vetorVelocidade: vel, velocidadeQueda: 0.0 });

    enviarEstadoMultiplayer('bomba', {
        posBomba: { x: bomba.position.x, y: bomba.position.y, z: bomba.position.z },
        vetorVel: { x: vel.x, y: vel.y, z: vel.z }
    });

    podeSoltarBomba = false;
    setTimeout(() => { podeSoltarBomba = true; }, 1400);
}

const teclas = {};
window.addEventListener('keydown', (e) => {
    teclas[e.code] = true;
    if (e.code === 'Space') atirar();
    if (e.code === 'KeyB') soltarBomba();

    if (e.code === 'Digit1') {
        armaSelecionada = 1;
        atualizarHUD();
    }
    if (e.code === 'Digit2') {
        armaSelecionada = 2;
        atualizarHUD();
    }
});
window.addEventListener('keyup', (e) => teclas[e.code] = false);

let contadorFrames = 0;

function animar() {
    requestAnimationFrame(animar);
    contadorFrames++;

    if (veiculoAtual && !jogadorDestruido) {
        if (tipoVeiculo === 'tanque') {
            const posAntiga = tanque.position.clone();

            if (teclas['KeyW']) tanque.translateZ(-0.22);
            if (teclas['KeyS']) tanque.translateZ(0.16);
            if (teclas['KeyA']) tanque.rotation.y += 0.03;
            if (teclas['KeyD']) tanque.rotation.y -= 0.03;

            if (tanque.position.x > 0) tanque.position.x = 0;

            const boxTanque = new THREE.Box3().setFromObject(tanque);
            for (let obs of estruturasComColisao) {
                if (boxTanque.intersectsBox(obs.box)) {
                    tanque.position.copy(posAntiga);
                    break;
                }
            }

            if (teclas['KeyQ']) torre.rotation.y += 0.04;
            if (teclas['KeyE']) torre.rotation.y -= 0.04;

            const anguloBase = -Math.PI / 2;
            if (teclas['ArrowUp'] && canhao.rotation.x < anguloBase + 0.5) canhao.rotation.x += 0.02;
            if (teclas['ArrowDown'] && canhao.rotation.x > anguloBase - 0.1) canhao.rotation.x -= 0.02;

        } else if (tipoVeiculo === 'aviao') {
            aviao.translateZ(-0.55);

            if (teclas['KeyS']) aviao.rotateX(-0.025);
            if (teclas['KeyW']) aviao.rotateX(0.025);
            if (teclas['KeyA']) aviao.rotateY(0.02);
            if (teclas['KeyD']) aviao.rotateY(-0.02);
            if (teclas['KeyQ']) aviao.rotateZ(0.035);
            if (teclas['KeyE']) aviao.rotateZ(-0.035);

            const boxAviao = new THREE.Box3().setFromObject(aviao);
            let bateu = aviao.position.y <= 1.2;

            if (!bateu) {
                for (let obs of estruturasComColisao) {
                    if (boxAviao.intersectsBox(obs.box)) { bateu = true; break; }
                }
            }

            if (bateu) {
                criarExplosao(aviao.position);
                resetarAviao();
            }

        } else if (tipoVeiculo === 'navio') {
            if (teclas['KeyW']) navio.translateZ(-0.18);
            if (teclas['KeyS']) navio.translateZ(0.10);
            if (teclas['KeyA']) navio.rotation.y += 0.012;
            if (teclas['KeyD']) navio.rotation.y -= 0.012;

            if (navio.position.x < 15) navio.position.x = 15;
            navio.position.y = Math.sin(Date.now() * 0.002) * 0.2;

            if (teclas['KeyQ']) torreNavalFrente.rotation.y += 0.03;
            if (teclas['KeyE']) torreNavalFrente.rotation.y -= 0.03;
        }

        // --- SISTEMA DE CÂMERA (Alternar com C) ---
        if (teclas['KeyC']) {
            teclas['KeyC'] = false; // Trava para evitar alternância contínua
            modoCameraMira = !modoCameraMira;
        }

        if (modoCameraMira && tipoVeiculo === 'tanque') {
            // Esconde o canhão para não obstruir a visão
            canhao.visible = false;

            const posTorre = new THREE.Vector3();
            torre.getWorldPosition(posTorre);

            const dirTorre = new THREE.Vector3();
            torre.getWorldDirection(dirTorre);

            // Posiciona a câmera ligeiramente acima e à frente da torre
            camera.position.copy(posTorre);
            camera.position.y += 0.4; 
            camera.position.addScaledVector(dirTorre, -1.8); 

            // Aponta a câmera para onde o canhão mira
            const dirCanhao = new THREE.Vector3();
            canhao.getWorldDirection(dirCanhao);
            const pontoMira = camera.position.clone().addScaledVector(dirCanhao, 100);
            
            camera.lookAt(pontoMira);
        } else {
            // Restaura a visibilidade do canhão fora da mira
            if (canhao) canhao.visible = true;

            let dist = 13, alt = 6;
            if (tipoVeiculo === 'aviao') { dist = 18; alt = 7; }
            if (tipoVeiculo === 'navio') { dist = 32; alt = 14; }
            
            const dir = new THREE.Vector3();
            if (tipoVeiculo === 'tanque') torre.getWorldDirection(dir);
            else if (tipoVeiculo === 'aviao') aviao.getWorldDirection(dir);
            else if (tipoVeiculo === 'navio') navio.getWorldDirection(dir);

            camera.position.x = veiculoAtual.position.x + dir.x * dist;
            camera.position.z = veiculoAtual.position.z + dir.z * dist;
            camera.position.y = veiculoAtual.position.y + alt;
            camera.lookAt(veiculoAtual.position);
        }

        if (contadorFrames % 3 === 0) enviarEstadoMultiplayer('posicao');
    }

    for (let i = tiros.length - 1; i >= 0; i--) {
        const t = tiros[i];
        t.mesh.position.addScaledVector(t.direcao, t.velocidade);
        t.distancia += t.velocidade;

        let colidiu = false;

        // Colisão com IA
        for (let j = inimigos.length - 1; j >= 0; j--) {
            if (t.mesh.position.distanceTo(inimigos[j].position) < t.raioDano) {
                criarExplosao(inimigos[j].position);
                cena.remove(inimigos[j]);
                inimigos.splice(j, 1);
                colidiu = true;
                break;
            }
        }

        // Colisão com Outros Jogadores
        if (!colidiu) {
            for (let id in outrosJogadores) {
                const p = outrosJogadores[id];
                if (p && p.mesh && t.mesh.position.distanceTo(p.mesh.position) < t.raioDano + 1.5) {
                    criarExplosao(t.mesh.position);
                    colidiu = true;
                    enviarEstadoMultiplayer('tomouDano', { alvoId: id, dano: t.dano || 20 });
                    break;
                }
            }
        }

        if (colidiu || t.distancia > 350 || t.mesh.position.y <= -1) {
            cena.remove(t.mesh);
            tiros.splice(i, 1);
        }
    }

    for (let i = bombas.length - 1; i >= 0; i--) {
        const b = bombas[i];
        b.velocidadeQueda += 0.018;
        b.mesh.position.y -= b.velocidadeQueda;
        b.mesh.position.add(b.vetorVelocidade);

        if (b.mesh.position.y <= 0.2) {
            criarExplosao(b.mesh.position);
            
            for (let id in outrosJogadores) {
                const p = outrosJogadores[id];
                if (p && p.mesh && b.mesh.position.distanceTo(p.mesh.position) < 8.0) {
                    enviarEstadoMultiplayer('tomouDano', { alvoId: id, dano: 60 });
                }
            }

            cena.remove(b.mesh);
            bombas.splice(i, 1);
        }
    }

    renderizador.render(cena, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
});

animar();