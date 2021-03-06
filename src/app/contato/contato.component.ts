import { Component, OnInit } from '@angular/core';
import { ContatoService } from '../contato.service';
import { Contato } from './contato';
import {ContatoDetalheComponent} from '../contato-detalhe/contato-detalhe.component';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog'
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario : FormGroup;
  contatos : Contato[] = [];
  colunas = ['foto', 'id', 'nome', 'email', 'favorito'];
  totalElementos : number  = 0;
  pagina :number = 0;
  tamanho :number = 2;
  pageSizeOptions :number[]   = [10];


  constructor(private service : ContatoService, 
              private fb : FormBuilder,
              private dialog : MatDialog,
              private snackBar : MatSnackBar) {
   
   }

  ngOnInit(): void {
    this.montarFormulario();
    this.listarContatos(this.pagina, this.tamanho);
  }

  favoritar(contato : Contato){
    this.service.favorite(contato).subscribe(response => {
      contato.favorito = !contato.favorito;
    });
  }
  
  visualizarContato(contato : Contato){

    this.dialog.open(ContatoDetalheComponent, {
      width : '400px',
      height : '450px',
      data : contato
    } )
  }

  montarFormulario(){
    this.formulario = this.fb.group({
      nome : ['', Validators.required],
      email: ['', Validators.email]
    });
  }

  listarContatos(pagina, tamanho){
    this.service.list(pagina, tamanho).subscribe(response => {
      this.contatos = response.content;
      this.totalElementos = response.totalElements;
      this.pagina = response.number
    })
  }

  submit(){
    let formValues = this.formulario.value;
    let cont : Contato = new Contato(formValues.nome, formValues.email);
    this.service
    .salvar(cont)
    .subscribe(response => {
     
      this.listarContatos(this.pagina, this.tamanho);
      this.snackBar.open('Contato adicionado', 'Sucesso', {duration : 2000});
      this.formulario.reset();
    });
   
  }
  paginar(event : PageEvent){
    this.pagina = event.pageIndex;
    this.listarContatos(this.pagina, this.tamanho);
  }

  upload(event, contato){
    let files = event.target.files;

    if (files){
      let foto = files[0];
      let formData = new FormData();
      formData.append("foto", foto);
      this.service
      .upload(contato, formData)
      .subscribe(response => {
        this.listarContatos(this.pagina, this.tamanho);
      });
    }
  }

}
