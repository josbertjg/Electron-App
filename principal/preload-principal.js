const {ipcRenderer,contextBridge} = require("electron");
contextBridge.exposeInMainWorld("api",{
    mostrarUsuario:(f)=>{
        ipcRenderer.on("mostrarUsuario",(event,nombre,foto)=>{
            f(nombre,foto);
        })
    },
    cerrarSesion:()=>{
        ipcRenderer.send("cerrarSesion")
    },
    minimizarVentana: ()=>{
        ipcRenderer.send("minimizarVentana")
    },
    maximizarVentana: ()=>{
        ipcRenderer.send("maximizarVentana")
    },
    cerrarVentana: ()=>{
        ipcRenderer.send("cerrarVentana")
    }
});
ipcRenderer.on("cambiarFotoPerfil",(event,ruta)=>{
    
    fetch(ruta)
    document.getElementById("fotoUsuario").setAttribute("src",ruta)

})