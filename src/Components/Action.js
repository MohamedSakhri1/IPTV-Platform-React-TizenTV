import './Action.css'

export default function Action({label , Svg}) {
    return (
        <div className="action-container">
            <Svg className='bottom-action-icon'/>
            <p className='bottom-action-text'>{label}</p>
        </div>
    )
}