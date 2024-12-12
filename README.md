# IPTV-Platform-React-Tizen-TV
cette application est en cours de devloppement
## guide de deployement sur une TV Samsung Tizen
1. Installation de Tizen Studio
2. Creation d'un compte Samsung devlopper
3. Creation d'une sertificat Samsung
4. Activer DEVELOPER_MODE sur la TV
5. Connecter l'ordinateur avec la tv a travers 'Device Manager'
6. modifier les scripts de `Package.json` par
```
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build && cp tizen/* build && tizen build-web -- build && tizen package -t wgt -s <entrer le nom de votre Sertificat> -- build/.buildResult",
    "deploy": "tizen install -n \"GalaxyTV.wgt\" -- build/.buildResult",
    "debug": "tizen install -n GalaxyTV.wgt -- build/.buildResult && tizen run -p <Enter le code unique (Optionnel)>.galaxytv",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
```
### Generation de Code Unique de .wgt (Optionnel)
1. dans le 'Tizen Studio' creer un projet vide
2. le fichier `config.xml` a un attribut
```
<tizen:application id="<Code Unique>.galaxytv" package="<Code Unique>" required_version="2.3"/>
```
3. Coupier ce Code Unique est le coller dans le script Debug
