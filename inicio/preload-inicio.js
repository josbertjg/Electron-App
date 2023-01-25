const {ipcRenderer,contextBridge} = require("electron");
contextBridge.exposeInMainWorld("api",{
    iniciarSesion: (datos,f)=>{
        ipcRenderer.send("iniciarSesion",datos);
        ipcRenderer.on("mensaje",()=>f())
    },
    registrarse:(registro)=>{
        ipcRenderer.send("registrarse",registro);
    },
    cargarFoto: (f)=>{
        ipcRenderer.invoke("cargarFoto")
        .then((respuesta)=>{
            if(!respuesta.canceled){
                f(respuesta.filePaths[0])
            }else{
                console.log("El usuario cancelo la ventana de dialogo")
            }
        })
    },
    copiarFoto: (src,usuario,f)=>{
        ipcRenderer.send("copiarFoto",src,usuario);
        ipcRenderer.on("ruta",(event,src)=>f(src))
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
