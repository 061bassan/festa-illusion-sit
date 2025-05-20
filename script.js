document.addEventListener('DOMContentLoaded', () => {
    // Elementos das seções
    const heroSection = document.getElementById('hero');
    const formularioSection = document.getElementById('formulario-section');
    const pagamentoSection = document.getElementById('pagamento-section');

    // Botões de navegação
    const btnAdquirirIngresso = document.getElementById('btnAdquirirIngresso');
    const btnVoltarHero = document.getElementById('btnVoltarHero');
    const btnVoltarFormulario = document.getElementById('btnVoltarFormulario');

    // Formulário e seus campos
    const ingressoForm = document.getElementById('ingressoForm');
    const nomeCompletoInput = document.getElementById('nomeCompleto');
    const dataNascimentoInput = document.getElementById('dataNascimento');
    const cpfInput = document.getElementById('cpf');
    const sexoInput = document.getElementById('sexo');
    const celularInput = document.getElementById('celular');
    const formProceedStatus = document.getElementById('formProceedStatus'); // Para erros de validação inicial

    // Elementos da seção de pagamento
    const chavePixElement = document.getElementById('chavePix');
    const btnCopiarChave = document.getElementById('btnCopiarChave');
    const btnPagamentoRealizado = document.getElementById('btnPagamentoRealizado');
    const formSubmitStatus = document.getElementById('formSubmitStatus'); // Para status do envio
    const comprovanteSection = document.getElementById('comprovanteSection');
    const btnEnviarComprovanteLuiz = document.getElementById('btnEnviarComprovanteLuiz');
    const btnEnviarComprovanteGuilherme = document.getElementById('btnEnviarComprovanteGuilherme');
    
    const btnSuporteWhatsapp = document.getElementById('btnSuporteWhatsapp');

    const NUMERO_SUPORTE = "556195085850";
    const NUMERO_COMPROVANTE_LUIZ = "556195085850";
    const NUMERO_COMPROVANTE_GUILHERME = "556198792904";
    const MENSAGEM_SUPORTE = "Oii, estou com algumas dúvidas sobre a Illusion, consegue me ajudar por favor?";
    // FORMSPREE_ENDPOINT não é mais usado para o fetch direto.
    // const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjkwzlyq'; 

    let storedFormData = null; // Para armazenar os dados do formulário temporariamente

    function mostrarSecao(secaoAtiva) {
        [heroSection, formularioSection, pagamentoSection].forEach(secao => {
            if (secao) secao.classList.remove('active');
        });
        if (secaoAtiva) {
            secaoAtiva.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    if (btnAdquirirIngresso) btnAdquirirIngresso.addEventListener('click', () => mostrarSecao(formularioSection));
    if (btnVoltarHero) btnVoltarHero.addEventListener('click', () => mostrarSecao(heroSection));
    if (btnVoltarFormulario) {
        btnVoltarFormulario.addEventListener('click', () => {
            mostrarSecao(formularioSection);
            // Resetar estado da página de pagamento se voltar
            if (comprovanteSection) comprovanteSection.classList.add('hidden');
            if (formSubmitStatus) formSubmitStatus.textContent = '';
            if (btnPagamentoRealizado) btnPagamentoRealizado.disabled = false;
        });
    }
    
    function validarCampo(input, condicao, mensagemErro) {
        const errorMsgElement = input.parentElement.querySelector('.error-message');
        if (condicao) {
            input.classList.remove('invalid');
            if (errorMsgElement) errorMsgElement.textContent = '';
            return true;
        } else {
            input.classList.add('invalid');
            if (errorMsgElement) errorMsgElement.textContent = mensagemErro;
            return false;
        }
    }

    function validarFormulario() {
        let isValid = true;
        isValid = validarCampo(nomeCompletoInput, nomeCompletoInput.value.trim().split(' ').length >= 2 && nomeCompletoInput.value.trim().length >=5, "Informe nome e sobrenome (mín. 5 caracteres).") && isValid;
        isValid = validarCampo(dataNascimentoInput, dataNascimentoInput.value !== '', "Informe sua data de nascimento.") && isValid;
        isValid = validarCampo(cpfInput, /^\d{11}$/.test(cpfInput.value.replace(/\D/g, '')), "CPF inválido. Informe 11 números.") && isValid;
        isValid = validarCampo(sexoInput, sexoInput.value !== '', "Selecione o sexo.") && isValid;
        const celularValido = /^\d{10,15}$/.test(celularInput.value.replace(/\D/g, ''));
        isValid = validarCampo(celularInput, celularValido, "Celular inválido (10 a 15 números com DDD).") && isValid;
        return isValid;
    }

    [nomeCompletoInput, dataNascimentoInput, cpfInput, sexoInput, celularInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                if (input.id === 'cpf' || input.id === 'celular') {
                    input.value = input.value.replace(/\D/g, '');
                }
                switch(input.id) {
                    case 'nomeCompleto': validarCampo(input, input.value.trim().split(' ').length >= 2 && input.value.trim().length >=5, "Informe nome e sobrenome (mín. 5 caracteres)."); break;
                    case 'dataNascimento': validarCampo(input, input.value !== '', "Informe sua data de nascimento."); break;
                    case 'cpf': validarCampo(input, /^\d{11}$/.test(input.value), "CPF inválido. Informe 11 números."); break;
                    case 'sexo': validarCampo(input, input.value !== '', "Selecione o sexo."); break;
                    case 'celular': validarCampo(input, /^\d{10,15}$/.test(input.value), "Celular inválido (10 a 15 números com DDD)."); break;
                }
            });
        }
    });

    // SUBMISSÃO INICIAL DO FORMULÁRIO (APENAS VALIDA E ARMAZENA)
    if (ingressoForm) {
        ingressoForm.addEventListener('submit', function(event) {
            event.preventDefault();
            formProceedStatus.textContent = '';
            formProceedStatus.className = 'form-status';

            if (!validarFormulario()) {
                formProceedStatus.textContent = 'Por favor, corrija os erros no formulário.';
                formProceedStatus.classList.add('error');
                const firstInvalidField = ingressoForm.querySelector('.invalid');
                if (firstInvalidField) firstInvalidField.focus();
                return;
            }

            storedFormData = new FormData(ingressoForm);
            localStorage.setItem('nomePagador', storedFormData.get('nomeCompleto'));
            
            mostrarSecao(pagamentoSection);
        });
    }

    // BOTÃO "PAGAMENTO REALIZADO" - ENVIA OS DADOS ARMAZENADOS PARA O NETLIFY
    if (btnPagamentoRealizado) {
        btnPagamentoRealizado.addEventListener('click', async () => {
            if (!storedFormData) {
                formSubmitStatus.textContent = 'Erro: Dados do formulário não encontrados. Por favor, preencha o formulário novamente.';
                formSubmitStatus.className = 'form-status error';
                return;
            }

            formSubmitStatus.textContent = 'Processando seu pedido e enviando dados...';
            formSubmitStatus.className = 'form-status';
            btnPagamentoRealizado.disabled = true;

            const netlifyData = new URLSearchParams();
            for (const pair of storedFormData.entries()) {
                netlifyData.append(pair[0], pair[1]);
            }
            // Garante que 'form-name' está presente e corresponde ao HTML.
            // O nome do formulário DEVE corresponder ao <input type="hidden" name="form-name" value="NOME_DO_FORMULARIO_AQUI">
            // e ao atributo 'name' da tag <form name="NOME_DO_FORMULARIO_AQUI">
            // No seu HTML está: <form id="ingressoForm" name="form-illusion" ...> e <input type="hidden" name="form-name" value="form-illusion" />
            // Então vamos usar "form-illusion"
            if (!netlifyData.has('form-name')) {
                netlifyData.append('form-name', 'form-illusion'); 
            }


            try {
                // O POST deve ser para o caminho da página onde o formulário está definido.
                // Se o formulário está em index.html na raiz, "/" ou window.location.pathname (se na raiz) funciona.
                // Se o site está em um subdiretório no Netlify (ex: meusite.netlify.app/festa/),
                // window.location.pathname será mais robusto. Para a maioria dos casos simples, "/" é ok.
                const response = await fetch("/", { // Usar "/" se o index.html é a raiz.
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: netlifyData.toString() 
                });

                if (response.ok) {
                    formSubmitStatus.textContent = 'Seus dados foram registrados com sucesso!';
                    formSubmitStatus.classList.add('success');
                    if (comprovanteSection) comprovanteSection.classList.remove('hidden');
                    if(ingressoForm) ingressoForm.reset(); 
                    storedFormData = null; 
                } else {
                    formSubmitStatus.textContent = `Ocorreu um erro ao registrar seus dados (Status: ${response.status}). Verifique os logs do Netlify ou contate o suporte.`;
                    formSubmitStatus.classList.add('error');
                    btnPagamentoRealizado.disabled = false;
                }
            } catch (error) {
                console.error('Erro no envio para Netlify Forms:', error);
                formSubmitStatus.textContent = 'Erro de conexão ao registrar seus dados. Verifique sua internet e tente novamente.';
                formSubmitStatus.classList.add('error');
                btnPagamentoRealizado.disabled = false;
            }
        });
    }

    // SEÇÃO DE PAGAMENTO - COPIAR CHAVE E ENVIAR COMPROVANTE
    if (btnCopiarChave && chavePixElement) {
        btnCopiarChave.addEventListener('click', () => {
            const chave = chavePixElement.dataset.chave;
            navigator.clipboard.writeText(chave).then(() => {
                const originalIcon = btnCopiarChave.innerHTML;
                btnCopiarChave.innerHTML = '<i class="fas fa-check"></i>';
                btnCopiarChave.title = "Copiado!";
                setTimeout(() => {
                    btnCopiarChave.innerHTML = originalIcon;
                    btnCopiarChave.title = "Copiar Chave";
                }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar chave PIX: ', err);
                alert('Não foi possível copiar a chave. Por favor, copie manualmente: ' + chave);
            });
        });
    }

    function gerarLinkWhatsAppComprovante(numero) {
        const nomePagador = localStorage.getItem('nomePagador') || '[Nome não capturado]';
        const mensagemBase = `Oii sou a(o) ${nomePagador}, acabei de realizar o pagamento da "Illusion", aqui segue meu comprovante:`;
        return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemBase)}`;
    }
    
    if (btnEnviarComprovanteLuiz) {
        btnEnviarComprovanteLuiz.addEventListener('click', () => {
            window.open(gerarLinkWhatsAppComprovante(NUMERO_COMPROVANTE_LUIZ), '_blank');
        });
    }
    if (btnEnviarComprovanteGuilherme) {
        btnEnviarComprovanteGuilherme.addEventListener('click', () => {
            window.open(gerarLinkWhatsAppComprovante(NUMERO_COMPROVANTE_GUILHERME), '_blank');
        });
    }

    if (btnSuporteWhatsapp) {
        btnSuporteWhatsapp.href = `https://wa.me/${NUMERO_SUPORTE}?text=${encodeURIComponent(MENSAGEM_SUPORTE)}`;
    }

    if (heroSection) mostrarSecao(heroSection);
    else console.error("Seção Hero não encontrada!");
});