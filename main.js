const {app,BrowserWindow,ipcMain,dialog,webContents,globalShortcut,Tray,Menu,Notification} = require("electron");
const fs = require("fs");
const Store = require('electron-store');

const store = new Store();

let inicio,principal,contentInicio,contentPrincipal,usuarios,tray,sesionIniciada,menuSecundario,menuInicio,nombreUsuario;
//CARGA DE LA APP
app.on("ready",()=>{
    inicio = new BrowserWindow({
        show:false,
        webPreferences:{
            preload: __dirname+"\\inicio\\preload-inicio.js",
            nodeIntegration:false,
            contextIsolation:true
        },
        frame:false,
        icon:"./img/logo.jpg"
    });
    principal = new BrowserWindow({
        show:false,
        webPreferences:{
            preload: __dirname+"\\principal\\preload-principal.js",
            nodeIntegration:false,
            contextIsolation:true
        },
        frame:false,
        icon:"./img/logo.jpg"
    });

    inicio.loadFile("./inicio/inicio.html");
    principal.loadFile("./principal/principal.html")
    sesionIniciada=false;

    contentInicio= inicio.webContents;
    contentPrincipal= principal.webContents;

    contentInicio.on("did-finish-load",()=>{
        contentInicio.openDevTools();
        inicio.show();
    })

    //ESCONDIENDO LAS VENTANAS CUANDO SE PRESIONA ALT+F4
    inicio.on("close",(event)=>{
        event.preventDefault();
        inicio.hide();
    });
    principal.on("close",(event)=>{
        event.preventDefault();
        principal.hide();
    })

    //ICONO DE LA APP
    tray=new Tray("./img/logo.jpg");
    tray.setToolTip("Neopixels App");

    //MENU DE INICIO
    menuInicio = Menu.buildFromTemplate([
        { label: 'Iniciar Sesion',click: ()=>{
            inicio.show();
        }},
        { label: 'Cerrar',click: ()=>app.exit()}
    ]);

    //MENU CUANDO SE INICIA LA SESION
    menuSecundario = Menu.buildFromTemplate([
        { label: 'Cerrar Sesion',click: ()=>{
            principal.hide();
            inicio.show();
            sesionIniciada=false;
            tray.setContextMenu(menuInicio);
        }},
        { label: 'Cambiar Foto de Perfil',click: ()=>{
            dialog.showOpenDialog(null,{
                title:"Selecciona una imagen",
                buttonLabel:"Seleccionar",
                filters:[
                    { name: 'Imagenes', extensions: ['jpg', 'png', 'jpeg'] }
                ]
            })
            .then((response)=>{
                if(!response.canceled){
                    let notificacion
                    //COPIANDO LA NUEVA IMAGEN
                    fs.copyFile(response.filePaths[0],__dirname+`\\imgUsuarios\\${nombreUsuario}.jpg`,(error)=>{
                        if(error){
                            notificacion = new Notification({
                                title: "Ocurrio un error al copiar la imagen.",
                                body: error,
                                icon: "./img/logo.jpg"
                            })
                            notificacion.show();
                        }else{
                            //ENVIANDO MENSAJE AL PRELOAD
                            contentPrincipal.send("cambiarFotoPerfil",__dirname+`\\imgUsuarios\\${nombreUsuario}.jpg`)

                            //ESCRIBIENDO LOS DATOS EN usuarios.json
                            try{
                                let respuesta= fs.readFileSync(__dirname+"\\usuarios.json")
                                respuesta=JSON.parse(respuesta);

                                for(let i=0;i<respuesta.usuarios.length;i++){
                                    if(respuesta.usuarios[i].usuario.toUpperCase()==nombreUsuario.toUpperCase()){
                                        respuesta.usuarios[i].foto=__dirname+`\\imgUsuarios\\${nombreUsuario}.jpg`;
                                        break;
                                    }
                                }

                                fs.writeFileSync(__dirname+"\\usuarios.json",JSON.stringify(respuesta))
                                console.log("Se escribio en el archivo correctamente")
                            }catch(e){
                                console.log("No se pudo realizar tu registro");
                                console.log(e)
                            }

                            notificacion = new Notification({
                                title: "Cambio de foto de perfil exitoso.",
                                body: "Se ha cambiado su foto de perfil por la imagen seleccionada.",
                                icon: "./img/logo.jpg"
                            })
                            notificacion.show();
                        }
                    });
                }
            })
        }},
        { label: 'Cerrar',click: ()=>app.exit()}
    ]);

    tray.setContextMenu(menuInicio);
    tray.on("click",()=>{
        if(sesionIniciada){
            principal.show();
        }else{
            inicio.show();
        }
    })
});

//INICIO DE SESION
ipcMain.on("iniciarSesion",(event,datos)=>{
    let encontrado=false;
    try{
        usuarios= fs.readFileSync(__dirname+"\\usuarios.json")
        usuarios=JSON.parse(usuarios);
        usuarios=usuarios.usuarios;

        for(let i=0;i<usuarios.length;i++){
            if(datos.usuario.toUpperCase()==usuarios[i].usuario.toUpperCase() && datos.contraseña==usuarios[i].contraseña){
                encontrado=true;
                inicio.hide();
                principal.show();
                sesionIniciada=true;
                tray.setContextMenu(menuSecundario);
                contentPrincipal.send("mostrarUsuario",usuarios[i].nombre,usuarios[i].foto)
                contentPrincipal.openDevTools();
                nombreUsuario=datos.usuario

                //FECHA
                let fecha = new Date();
                if(store.get("fecha")==undefined)
                    store.set("fecha",fecha.toString())
                //NOTIFICACION
                let notificacion=new Notification({
                    title:"Tu última sesión fue:",
                    body:store.get("fecha"),
                    icon:"./img/logo.jpg"
                })
                notificacion.show()
                store.set("fecha",fecha.toString());
                break;
            }else{
                encontrado=false;
            }
        }
    }catch(e){
        console.log("No se pudo abrir el archivo");
        console.log(e)
    }

    if(!encontrado)
        event.reply("mensaje");

});
//REGISTRO
ipcMain.on("registrarse",(event,registro)=>{
    try{
        usuarios= fs.readFileSync(__dirname+"\\usuarios.json")
        usuarios=JSON.parse(usuarios);
        usuarios.usuarios.push(registro);
        fs.writeFileSync(__dirname+"\\usuarios.json",JSON.stringify(usuarios))
        console.log("Tu registro fue exitoso")
        dialog.showMessageBox(null,{
            title:"Registro exitoso",
            message:"Tu registro fue exitoso!",
            type:"info"
        })
    }catch(e){
        console.log("No se pudo realizar tu registro");
        console.log(e)
    }
});
//CARGAR FOTO
ipcMain.handle("cargarFoto",()=>{
    return dialog.showOpenDialog(inicio,{
        title:"Selecciona una imagen",
        buttonLabel:"Seleccionar",
        filters:[
            { name: 'Imagenes', extensions: ['jpg', 'png', 'jpeg'] }
        ]
    });
});
//COPIAR FOTO
ipcMain.on("copiarFoto",(event,src,usuario)=>{
    fs.copyFile(src,__dirname+`\\imgUsuarios\\${usuario}.jpg`,(error)=>{
        if(error){
            console.log("Ocurrio un error al copiar");
            console.log(error);
        }else{
            console.log("Se copio el archivo correctamente");
            event.reply("ruta",__dirname+`\\imgUsuarios\\${usuario}.jpg`)
        }
    })
})
//MINIMIZAR LA VENTANA
ipcMain.on("minimizarVentana",(event)=>{
    let win = BrowserWindow.fromWebContents(event.sender);
    if(win.isMinimized())
        win.unminimize();
    else
        win.minimize();
});
//MAXIMIZAR LA VENTANA LA VENTANA
ipcMain.on("maximizarVentana",(event)=>{
    let win = BrowserWindow.fromWebContents(event.sender);
    if(win.isMaximized())
        win.unmaximize();
    else
        win.maximize();
});
//CERRAR LA VENTANA
ipcMain.on("cerrarVentana",(event)=>{
    let win = BrowserWindow.fromWebContents(event.sender);
    win.hide();
});
//CEERRAR LA SESION
ipcMain.on("cerrarSesion",()=>{
    principal.hide();
    inicio.show();
});