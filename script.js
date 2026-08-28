
/* ==========================================
   ESCALA MENSAL
========================================== */


/* ==========================================
   DADOS
========================================== */

let funcionarios =
    JSON.parse(
        localStorage.getItem("funcionarios")
    ) || [];


/* ==========================================
   INICIAR
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const hoje = new Date();


        document.getElementById("mes").value =
            hoje.getMonth();


        document.getElementById("ano").value =
            hoje.getFullYear();


        mostrarEscala();

    }
);


/* ==========================================
   CADASTRAR
========================================== */

function cadastrarFuncionario() {

    const nome =
        prompt(
            "Digite o nome do funcionário:"
        );


    if (
        !nome ||
        nome.trim() === ""
    ) {

        return;

    }


    funcionarios.push({

        id: Date.now(),

        nome: nome.trim(),

        escalas: {}

    });


    salvar();

    mostrarEscala();

}


/* ==========================================
   MOSTRAR ESCALA
========================================== */

function mostrarEscala() {

    const mes =
        Number(
            document.getElementById("mes").value
        );


    const ano =
        Number(
            document.getElementById("ano").value
        );


    const cabecalho =
        document.getElementById("cabecalho");


    const corpo =
        document.getElementById("corpo");


    const resultado =
        document.getElementById(
            "resultado-validacao"
        );


    cabecalho.innerHTML = "";

    corpo.innerHTML = "";

    resultado.innerHTML = "";


    const quantidadeDias =
        new Date(
            ano,
            mes + 1,
            0
        ).getDate();


    /* ======================================
       CABEÇALHO
    ====================================== */

    const trCabecalho =
        document.createElement("tr");


    const thNome =
        document.createElement("th");


    thNome.textContent =
        "Funcionário";


    trCabecalho.appendChild(
        thNome
    );


    const diasSemana = [
        "Dom",
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb"
    ];


    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {

        const data =
            new Date(
                ano,
                mes,
                dia
            );


        const th =
            document.createElement("th");


        th.innerHTML =
            dia +
            "<br><small>" +
            diasSemana[
                data.getDay()
            ] +
            "</small>";


        if (
            data.getDay() === 0
        ) {

            th.classList.add(
                "domingo"
            );

        }


        trCabecalho.appendChild(
            th
        );

    }


    cabecalho.appendChild(
        trCabecalho
    );


    /* ======================================
       FUNCIONÁRIOS
    ====================================== */

    funcionarios.forEach(
        funcionario => {

            const tr =
                document.createElement("tr");


            tr.dataset.funcionario =
                funcionario.id;


            const tdNome =
                document.createElement("td");


            tdNome.innerHTML = `

                <div class="nome-funcionario">

                    <span>
                        ${funcionario.nome}
                    </span>

                    <button
                        class="excluir"
                        onclick="
                            excluirFuncionario(
                                ${funcionario.id}
                            )
                        "
                    >
                        ×
                    </button>

                </div>

            `;


            tr.appendChild(
                tdNome
            );


            const chaveMes =
                criarChaveMes(
                    ano,
                    mes
                );


            if (
                !funcionario.escalas
            ) {

                funcionario.escalas = {};

            }


            for (
                let dia = 1;
                dia <= quantidadeDias;
                dia++
            ) {

                criarCelula(
                    tr,
                    funcionario,
                    chaveMes,
                    dia,
                    ano,
                    mes
                );

            }


            corpo.appendChild(
                tr
            );

        }
    );

}


/* ==========================================
   CRIAR CÉLULA
========================================== */

function criarCelula(
    tr,
    funcionario,
    chaveMes,
    dia,
    ano,
    mes
) {

    const td =
        document.createElement("td");


    td.className =
        "celula-dia";


    td.dataset.dia =
        dia;


    const chaveDia =
        String(dia).padStart(2, "0");


    const registro =
        obterRegistro(
            funcionario,
            chaveMes,
            chaveDia
        );


    /* ======================================
       SELECT
    ====================================== */

    const select =
        document.createElement("select");


    select.innerHTML = `

        <option value="">-</option>

        <option value="trabalho">
            Trabalho
        </option>

        <option value="folga">
            Folga
        </option>

        <option value="ferias">
            Férias
        </option>

        <option value="atestado">
            Atestado
        </option>

        <option value="outro">
            Outro
        </option>

    `;


    select.value =
        registro.tipo || "";


    /* ======================================
       HORÁRIO
    ====================================== */

    const input =
        document.createElement("input");


    input.type =
        "text";

    
input.inputMode = "numeric";

input.maxLength = 5;

input.placeholder = "Entrada";    
    input.placeholder = 
        "Entrada";


    input.value =
        registro.horario || "";


    atualizarCelula(
        td,
        select.value
    );


    controlarHorario();


    /* ======================================
       SELECT ALTERADO
    ====================================== */

    select.addEventListener(
        "change",
        () => {

            const novoTipo =
                select.value;


            if (
                novoTipo === "trabalho"
            ) {

                if (
                    !podeTrabalhar(
                        funcionario,
                        chaveMes,
                        dia
                    )
                ) {

                    alert(
                        "⚠️ Este funcionário já possui 6 dias consecutivos de trabalho.\n\nO próximo dia precisa ser uma folga."
                    );


                    select.value =
                        registro.tipo || "";


                    atualizarCelula(
                        td,
                        select.value
                    );


                    controlarHorario();

                    return;

                }

            }


            if (
                novoTipo !== "trabalho"
            ) {

                input.value = "";

            }


            salvarRegistro(
                funcionario,
                chaveMes,
                chaveDia,
                novoTipo,
                input.value
            );


            atualizarCelula(
                td,
                novoTipo
            );


            controlarHorario();

        }
    );


    /* ======================================
       HORÁRIO
    ====================================== */

   input.addEventListener(
    "input",
    () => {

        let valor = input.value;

        // Remove tudo que não for número
        valor = valor.replace(/\D/g, "");

        // Limita a 4 números
        valor = valor.substring(0, 4);

        // Coloca os dois pontos automaticamente
        if (valor.length >= 3) {

            valor =
                valor.substring(0, 2) +
                ":" +
                valor.substring(2);

        }

        input.value = valor;

        salvarRegistro(
            funcionario,
            chaveMes,
            chaveDia,
            select.value,
            input.value
        );

    }
);

    function controlarHorario() {

        if (
            select.value === "trabalho"
        ) {

            input.style.display =
                "block";

        } else {

            input.style.display =
                "none";

        }

    }


    /* ======================================
       DOMINGO
    ====================================== */

    const data =
        new Date(
            ano,
            mes,
            dia
        );


    if (
        data.getDay() === 0
    ) {

        td.classList.add(
            "domingo"
        );

    }


    td.appendChild(
        select
    );

    td.appendChild(
        input
    );


    tr.appendChild(
        td
    );

}


/* ==========================================
   REGISTRO
========================================== */

function obterRegistro(
    funcionario,
    chaveMes,
    chaveDia
) {

    return (
        funcionario.escalas?.[chaveMes]?.[chaveDia]
        || {
            tipo: "",
            horario: ""
        }
    );

}


/* ==========================================
   SALVAR REGISTRO
========================================== */

function salvarRegistro(
    funcionario,
    chaveMes,
    chaveDia,
    tipo,
    horario
) {

    if (
        !funcionario.escalas[chaveMes]
    ) {

        funcionario.escalas[chaveMes] =
            {};

    }


    if (
        tipo === ""
    ) {

        delete funcionario
            .escalas[chaveMes][chaveDia];

    } else {

        funcionario
            .escalas[chaveMes][chaveDia] = {

                tipo: tipo,

                horario: horario || ""

            };

    }


    salvar();

}


/* ==========================================
   REGRA 6x1
========================================== */

function podeTrabalhar(
    funcionario,
    chaveMes,
    dia
) {

    let consecutivos = 0;


    for (
        let d = dia - 1;
        d >= 1;
        d--
    ) {

        const registro =
            obterRegistro(
                funcionario,
                chaveMes,
                String(d).padStart(2, "0")
            );


        if (
            registro.tipo === "trabalho"
        ) {

            consecutivos++;

        } else {

            break;

        }

    }


    return consecutivos < 6;

}


/* ==========================================
   ATUALIZAR VISUAL
========================================== */

function atualizarCelula(
    td,
    tipo
) {

    td.classList.remove(
        "trabalho",
        "folga",
        "ferias",
        "atestado",
        "outro"
    );


    if (tipo) {

        td.classList.add(
            tipo
        );

    }

}


/* ==========================================
   VALIDAR ESCALA
========================================== */

function validarEscala() {

    const mes =
        Number(
            document.getElementById("mes").value
        );


    const ano =
        Number(
            document.getElementById("ano").value
        );


    const resultado =
        document.getElementById(
            "resultado-validacao"
        );


    resultado.innerHTML = "";


    if (
        funcionarios.length === 0
    ) {

        resultado.innerHTML = `

            <div class="validacao-aviso">

                ⚠️ Nenhum funcionário cadastrado.

            </div>

        `;

        return;

    }


    let totalErros = 0;


    resultado.innerHTML = `

        <div class="validacao-titulo">

            🔎 Resultado da validação

        </div>

    `;


    funcionarios.forEach(
        funcionario => {

            const problemas =
                analisarFuncionario(
                    funcionario,
                    ano,
                    mes
                );


            if (
                problemas.length === 0
            ) {

                resultado.innerHTML += `

                    <div class="validacao-ok">

                        ✅
                        <strong>
                            ${funcionario.nome}
                        </strong>

                        — escala válida.

                    </div>

                `;

            } else {

                totalErros +=
                    problemas.length;


                problemas.forEach(
                    problema => {

                        resultado.innerHTML += `

                            <div class="validacao-erro">

                                <strong>
                                    ${funcionario.nome}
                                </strong>

                                <br>

                                ${problema}

                            </div>

                        `;

                    }
                );

            }

        }
    );


    if (
        totalErros === 0
    ) {

        resultado.innerHTML += `

            <div class="validacao-ok">

                🎉
                <strong>
                    Escala aprovada!
                </strong>

                <br>

                Todos os funcionários
                estão dentro das regras.

            </div>

        `;

    }

}


/* ==========================================
   ANALISAR FUNCIONÁRIO
========================================== */

function analisarFuncionario(
    funcionario,
    ano,
    mes
) {

    const problemas = [];


    const quantidadeDias =
        new Date(
            ano,
            mes + 1,
            0
        ).getDate();


    const chaveMes =
        criarChaveMes(
            ano,
            mes
        );


    /* ======================================
       LIMPAR MARCAÇÕES
    ====================================== */

    const linha =
        document.querySelector(
            `tr[data-funcionario="${funcionario.id}"]`
        );


    if (linha) {

        linha
            .querySelectorAll(
                ".celula-dia"
            )
            .forEach(
                celula => {

                    celula.classList.remove(
                        "celula-problema",
                        "celula-aviso",
                        "celula-domingo-problema"
                    );

                }
            );

    }


    /* ======================================
       REGRA 6x1
    ====================================== */

    let consecutivos = 0;

    let inicio = 0;


    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {

        const registro =
            obterRegistro(
                funcionario,
                chaveMes,
                String(dia).padStart(2, "0")
            );


        if (
            registro.tipo === "trabalho"
        ) {

            if (
                consecutivos === 0
            ) {

                inicio = dia;

            }


            consecutivos++;


            if (
                consecutivos > 6
            ) {

                problemas.push(
                    `
                    ❌ Regra 6x1:
                    trabalho por mais de
                    6 dias consecutivos
                    entre os dias
                    <strong>
                        ${inicio}
                    </strong>
                    e
                    <strong>
                        ${dia}
                    </strong>.
                    `
                );


                const celula =
                    linha?.children[dia];


                if (celula) {

                    celula.classList.add(
                        "celula-problema"
                    );

                }

            }

        } else {

            consecutivos = 0;

        }

    }


    /* ======================================
       DOMINGO
    ====================================== */

    let domingoFolga =
        false;


    let domingos = [];


    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {

        const data =
            new Date(
                ano,
                mes,
                dia
            );


        if (
            data.getDay() !== 0
        ) {

            continue;

        }


        domingos.push(dia);


        const registro =
            obterRegistro(
                funcionario,
                chaveMes,
                String(dia).padStart(2, "0")
            );


        if (
            registro.tipo === "folga"
        ) {

            domingoFolga = true;

        }

    }


    if (
        !domingoFolga
    ) {

        problemas.push(
            `
            ❌ Nenhuma
            <strong>
                folga no domingo
            </strong>
            neste mês.
            `
        );


        domingos.forEach(
            dia => {

                const registro =
                    obterRegistro(
                        funcionario,
                        chaveMes,
                        String(dia).padStart(2, "0")
                    );


                if (
                    registro.tipo !== "folga"
                ) {

                    const celula =
                        linha?.children[dia];


                    if (celula) {

                        celula.classList.add(
                            "celula-domingo-problema"
                        );

                    }

                }

            }
        );

    }


    /* ======================================
       TRABALHO SEM HORÁRIO
    ====================================== */

    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {

        const registro =
            obterRegistro(
                funcionario,
                chaveMes,
                String(dia).padStart(2, "0")
            );


        if (
            registro.tipo === "trabalho" &&
            !registro.horario.trim()
        ) {

            problemas.push(
                `
                ⚠️ Dia
                <strong>
                    ${dia}
                </strong>
                está como Trabalho,
                mas não possui horário.
                `
            );


            const celula =
                linha?.children[dia];


            if (celula) {

                celula.classList.add(
                    "celula-aviso"
                );

            }

        }

    }


    return problemas;

}


/* ==========================================
   CHAVE DO MÊS
========================================== */

function criarChaveMes(
    ano,
    mes
) {

    return (
        ano +
        "-" +
        String(mes + 1)
            .padStart(2, "0")
    );

}


/* ==========================================
   EXCLUIR
========================================== */

function excluirFuncionario(
    id
) {

    const funcionario =
        funcionarios.find(
            f => f.id === id
        );


    if (!funcionario) {

        return;

    }


    if (
        !confirm(
            "Deseja excluir " +
            funcionario.nome +
            "?"
        )
    ) {

        return;

    }


    funcionarios =
        funcionarios.filter(
            f => f.id !== id
        );


    salvar();

    mostrarEscala();

}


/* ==========================================
   SALVAR
========================================== */

function salvar() {

    localStorage.setItem(
        "funcionarios",
        JSON.stringify(
            funcionarios
        )
    );

}
