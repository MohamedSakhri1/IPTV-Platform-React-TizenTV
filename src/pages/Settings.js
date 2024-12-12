import './Settings.css'
import { useState, useEffect } from 'react';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import WideButton from '../Components/WideButton';
import Button from '../Components/Button';
import { InputField } from './PlaylistForm';
import { db } from '../Database/db';
import Popup from '../Components/Popup';
/* global tizen */


export default function Settings() {
    const [selectedForm, setSelectedForm] = useState('Password'); // State to manage which form is displayed

    const { ref, focusKey, focusSelf } = useFocusable({
        trackChildren: true,
        focusKey: 'main-page-key',
    });

    useEffect(() => {
        focusSelf();  // Ensure focus is set to the grid when this page loads
    }, [focusSelf]);

    /** TIME */
    const [thisMoment, setThisMoment] = useState(new Date().toLocaleString());

    useEffect(() => {
        const interval = setInterval(() => {
            setThisMoment(new Date().toLocaleString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleFormSubmit = (data) => {
        console.log('Form data:', data);
        // Add your form submission logic here, for example, saving to IndexedDB
    };

    return (
        <FocusContext.Provider value={focusKey}>
            <div className="settings-page-wrapper">
                <div className="playlist-page-add">
                    <h1 className="playlist-page-header">Settings</h1>
                    <p className="current-date">{thisMoment}</p>
                </div>
                <div className="playlists-container-add" ref={ref}>
                    <div className="settings-choises">
                         {/* {Buttons: password - fav - recently watched - about} */}
                        <WideButton content='Parental Control' action={() => setSelectedForm('Password')} id='1'/>
                        <WideButton content='Favorites' action={() => setSelectedForm('Fav')} id='2'/>
                        <WideButton content='Recently Watched' action={() => setSelectedForm('RecentWatched')} id='3'/>
                        <WideButton content='About Galaxy TV' action={() => setSelectedForm('About')} id='4'/>
                    </div>
                    <div className="add-form">
                        { selectedForm === 'Password' ? <Password /> : ''}
                    </div>
                </div>
            </div>
        </FocusContext.Provider>
    );
}



function PasswordPopup({handleCancel, currPassword, handleOK, myMessage}) {
    useEffect(() => {
        if (window.tizen) {
            // Register all numeric keys in Tizen TV
            tizen.tvinputdevice.registerKeyBatch(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
        }
    }, []);


    const [myPass, setMyPass] = useState('')
    const [message, setMessage] = useState(myMessage)

    const handleDisable = () => {
        if(currPassword === myPass)
        {
            console.log('curr pass :', currPassword, ' mypass: ', myPass)
            handleOK()
            setTimeout( handleCancel , 100);
        }
        else
        {
            setMessage('Wrong password !!!')
            setTimeout( handleCancel , 2000);
        }
    } 




    return (
        <Popup  title='Enter Password' message={message} confirmLabel='Disable' onClose={handleCancel} onConfirm={handleDisable}>
            <PassInput placeholder=' Password here' autoComplete={'password'} value={myPass} onChange={(e) => setMyPass(e.target.value)}/>
        </Popup>
    )
}

function PassInput({id, placeholder, focusable, value, onChange}) {
    const style = {
        WebkitTextSecurity : 'disc',
        textAlign: 'center',

    }

    return (
        <InputField type='text' inputMode='numeric' maxLength='4' pattern="[0-9]{4}" style={style} id={id} placeholder={placeholder} focusable={focusable} value={value} onChange={onChange}/>
    )
}

function Password()
{
    const [enabled, setEnabled] = useState(null)
    const [currPassword, setCurrPassword] = useState(null)
    const [passCount, setPassCount] = useState(null)
    const [showPopup, setPopup] = useState(false)


    
    
    db.password.toCollection().first().then(
        (data) => {
            if(data !== undefined)
                {
                    setEnabled(() => data.enabled === 1 ? true : false )
                    // console.log('data.enable: ' , data.enabled, ' pasword: ', data.password)
                    setCurrPassword(data.password)
                }
            }
    )
    db.password.count().then( (count) =>{
        setPassCount(count)
    })
    /** toggel password enable */
    function toggelEnable() {
        if(passCount === 0)
        {
            db.password.add({enabled: 1, password: null})
            return;
        }

        if(enabled === true) {   
            if (currPassword === null) {
                db.password.toCollection().modify({enabled: 0})
                return;
            }
            setPopup(true)
        }
        else
            db.password.toCollection().modify({enabled: 1})
    }

    return(
        <>
        { currPassword === null || passCount === 0
            ? <NewPassword enabled={enabled} toggelEnable={toggelEnable}/>
            : <ChangePassword enabled={enabled} Pass={currPassword} toggelEnable={toggelEnable}/>
        }
        { showPopup && <PasswordPopup message={'Enter the old password to disable the password at all.'} handleCancel={() => setPopup(false)} currPassword={currPassword} handleOK={() => db.password.toCollection().modify({enabled: 0}) }/> }
        </>
    )
}


function NewPassword({enabled, toggelEnable}) 
{

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saved , setSaved] = useState(false)
    const { ref, focusKey }= useFocusable()

    /** form submition */
    function handleFormSubmit() {
        if(password === confirmPassword)
        {
            db.password.toCollection().modify({password: password, enabled: (enabled ? 1 : 0)}).then(() => {
                setSaved(true)
            })
        }
    }

    
    
    return (
        <FocusContext.Provider value={focusKey}>
    
            <div className="password-form" ref={ref}>
                <form className={'password-form-content' + (enabled ? ' enabled' : '')} onSubmit={handleFormSubmit}>                 
                    <label className='xtream-form-label' htmlFor='first-pass' >New Password :</label> <br/>
                    <PassInput id={'first-pass'} placeholder={' New Password'} focusable={enabled} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <label className='xtream-form-label' htmlFor='second-pass'>Confirm the Password :</label> <br/>
                    <PassInput id={'second-pass'} placeholder={' Repete the New Password'} focusable={enabled} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    <div className='password-form-button'>
                        <Button className='enable-pass-button' content={!saved ? 'Save the Password' : 'Password Saved !'} type='submit'  focusable={enabled}/>
                    </div>
                </form>
                <Button className='enable-pass-button' content={(enabled ? 'Desable' : 'Enable') + ' The Password'} action={toggelEnable} type='enable'/>
    
    
            </div>
        </FocusContext.Provider>
    )
}
function ChangePassword({enabled, Pass, toggelEnable}) 
{

    const [oldPass, setOldPass] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saved , setSaved] = useState(false)
    const { ref, focusKey }= useFocusable()

    /** password change submition */
    function handleFormSubmit() {
        if(oldPass === Pass && newPassword === confirmPassword)
        {
                db.password.toCollection().modify({password: newPassword, enabled: (enabled ? 1 : 0)})
                .then(() => {
                    setConfirmPassword('')
                    setNewPassword('')
                    setOldPass('')
                    setSaved(true)
                    console.log('new pass is : ', newPassword)
                    setTimeout(() => setSaved(false) , 1000)
                })
        }
    }

    
    
    return (
        <FocusContext.Provider value={focusKey}>
    
            <div className="password-form" ref={ref}>
                <form className={'password-form-content' + (enabled ? ' enabled' : '')} onSubmit={handleFormSubmit}>                 
                    <label className='xtream-form-label' htmlFor='first-pass'>Old Password :</label> <br/>
                    <PassInput id={'old-pass'} placeholder={' Enter the Old Pass Password'} focusable={enabled} value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
                    <label className='xtream-form-label' htmlFor='first-pass'>New Password :</label> <br/>
                    <PassInput id={'new-pass'} placeholder={' New Password'} focusable={enabled} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <label className='xtream-form-label' htmlFor='second-pass'>Confirm the Password :</label> <br/>
                    <PassInput id={'second-pass'} placeholder={' Repete the New Password'} focusable={enabled} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    <div className='password-form-button'>
                        <Button className='enable-pass-button' content={!saved ? 'Save the Password' : 'Password Saved !'}  focusable={enabled}/>
                    </div>
                </form>
                <Button className='enable-pass-button' content={(enabled ? 'Desable' : 'Enable') + ' The Password'} action={toggelEnable} type='enable'/>
    
    
            </div>
        </FocusContext.Provider>
    )
}