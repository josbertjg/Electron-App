window.onload=()=>{
    window.api.mostrarUsuario((nombre,src)=>{
        document.getElementById("nombreUsuario").innerText=nombre;
        document.getElementById("fotoUsuario").src=src;
    })
    document.getElementById("cerrarSesion").onclick=()=>{
        window.api.cerrarSesion();
    }
    /* OPCIONES DE MENU */
    //MINIMIZAR LA VENTANA
    document.getElementById("minimizar").onclick=()=>{
        console.log("click en minimizar")
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