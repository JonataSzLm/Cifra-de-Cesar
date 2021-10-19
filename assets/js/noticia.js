function limpaCampos() {
    document.getElementById("frmNoticia").reset();
}

$(document).ready(function() {
    $('#ModalNoticia').on('hide.bs.modal', function (e) {
        limpaCampos();
        //Exclui o valor atual do id selecionado
        $('#idNoticia').val('');
    });

    function inicializarTexto(){
        tinyMCE.init({
            selector: '#txtTexto',
            mode: 'textareas',
            theme: 'modern',
            height: 300,
            statusbar: false,
            plugins: [
                "advlist autolink lists link image charmap contextmenu paste preview print table insertdatetime media"
            ]
        });
    }

    function listarDados() {
        $.ajax({
			type: 'ajax',
            url: base_url + "Noticia/listar",
            dataType: 'json',
            method: 'POST',
			success: function(data) {
                var htmlFinal = '';

                if (data['dados'].length <= 0) { 
                    htmlFinal += '<tr><td colspan="5">Nenhum registro encontrado.</td></tr>';   
                } else {
                    $.each(data['dados'], function(i, obj) {
                        htmlFinal += '<tr>' +
                            '<td>' + obj.id + '</td>' + 
                            '<td>' + obj.titulo + '</td>' + 
                            '<td>' + obj.autor + '</td>' +
                            '<td>' + obj.visualizacoes + '</td>' +
                            '<td style="text-align: center;"><a id=' + obj.id + ' class="btn btn-info alterar">Alterar</a><a id=' + obj.id + ' class="btn btn-danger excluir">Excluir</a>';
                            htmlFinal += '</td></tr>';
                    });
                }

				$('#tblDadosNoticias').html(htmlFinal);
            },
            error: function(jqxhr) {
                alert('ATENÇÃO: Ocorreu um erro ao buscar as notícias.');
            }
		});
    }
	
	listarDados();

    //Exibe o modal para inserção de notícias
    $(document).on('click', '.inserir_noticia', function(){
        inicializarTexto();  
        $('h4.modal-title').text('Nova notícia');
        $('#ModalNoticia').modal('show');
    });

    //Salva os dados
    $('#frmNoticia').submit(function(event) {
        var texto = tinyMCE.get('txtTexto');
        $('#txtTexto').val(texto.getContent());

        event.preventDefault();

        $.ajax({
            type: 'ajax',
            url: base_url+'Noticia/salvar',
            data: $('#frmNoticia').serialize(),
            dataType: 'json',
            method: 'POST',
            success: function(data) {
                if (data.status) {
                    limpaCampos();
                    $('#ModalNoticia').modal('hide');
                }

                alert(data.mensagem);
            },
            error: function(jqxhr) {
                alert('ATENÇÃO: Ocorreu um erro ao salvar os dados da nova notícia.');
            },
            complete: function() {
                listarDados();
            }
        });

        return false;
    });

    //Busca os dados da Notícia quando clica para alterar
    $(document).on('click', '.alterar', function(){
        inicializarTexto();

        var NoticiaId = $(this).attr('id');
        $.ajax({
            type: 'ajax',
            url: base_url+'Noticia/retornarNoticia',
            data: {NoticiaId: NoticiaId},
            dataType: 'json',
            method: 'POST',
            success: function(data){
                if (data['dados'].length <= 0) {
                    alert('Os dados da notícia não foram encontrados.');
                } else {
                    $('#idNoticia').val(data['dados'][0].id);
                    $('#txtTitulo').val(data['dados'][0].titulo);
                    $('#txtAutor').val(data['dados'][0].autor);
                    $('#txtPublicacao').val(data['dados'][0].data_atualizacao);
                    $('#txtAssunto').val(data['dados'][0].assunto);

                    var texto = tinyMCE.get('txtTexto');
                    if (data['dados'][0].texto) {
                        texto.setContent(data['dados'][0].texto);
                    }

                    $('h4.modal-title').text('Alteração');                
                    $('#ModalNoticia').modal('show'); 
                }
            },
            error: function(data) {
                alert('ATENÇÃO: Erro ao buscar os dados da notícia.');
            }
        });  
    });
	
    $(document).on('click', '.excluir', function() {
        if (confirm('Tem certeza?')) {
            var NoticiaId = $(this).attr('id');

            $.ajax({
                type: 'ajax',
                url: base_url+'Noticia/excluir',
                data: {NoticiaId: NoticiaId},
                dataType: 'json',
                method: 'POST',
                success: function(data) {
                    if (data.status) {
                        listarDados();
                    }

                    alert(data.mensagem);
                },
                error: function() {
                    alert('Erro ao excluir!');
                }
            });
        }
    });

});