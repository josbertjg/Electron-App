window.onload=()=>{
    let foto=document.getElementById("foto");
    let srcFoto="";
    
    foto.style.display="none";
    //INICIAR SESION
    document.getElementById("btnIniciar").onclick=()=>{
        let usuario = new Object();
        usuario.usuario=document.getElementById("usuario").value;
        usuario.contraseña=document.getElementById("contraseña").value;
        window.api.iniciarSesion(usuario,()=>{
            document.getElementById("mensaje").innerText="El usuario y clave no han sido encontrados en la BD"; 
        });
    }
    //REGISTRARSE
    document.getElementById("btn-registrar").onclick=()=>{
        let registro=new Object();
        registro.nombre=document.getElementById("nombre").value;
        registro.usuario=document.getElementById("registro-usuario").value;
        registro.contraseña=document.getElementById("registro-contraseña").value;
        //COPIAR FOTO
        window.api.copiarFoto(srcFoto,registro.usuario,(destino)=>{
            console.log("Ruta que se guarda en el atributo json del usuario")
            console.log(destino)
            registro.foto=destino;
            window.api.registrarse(registro);
        });
    }
    //CARGAR FOTO
    document.getElementById("btn-foto").onclick=()=>{
        window.api.cargarFoto((src)=>{
            srcFoto=src;
            foto.src=src;
            foto.style.display="block";
        });
    }
    /* OPCIONES DE MENU */
    //MINIMIZAR LA VENTANA
    document.getElementById("minimizar").onclick=()=>{
        window.api.minimizarVentana();
    }
    //MAXIMIZAR LA VENTANA
    document.getElementById("maximizar").onclick=()=>{
        window.api.maximizarVentana();
    }
    //CERRAR LA VENTANA
    document.getElementById("cerrar").onclick=()=>{
        window.api.cerrarVentana();
    }
}