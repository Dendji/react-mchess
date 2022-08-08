import React from 'react'
import ButtonBase from '@mui/material/ButtonBase'
import Game from './Game'
import { ToastContainer } from 'react-toastify'
import { TextField } from '@mui/material'
import classnames from 'classnames'

const right = 'mendeleevchess'
export default function App(props) {
  // const [color, setColor] = React.useState(null)
  // const [p, setP] = React.useState('')
  const [color, setColor] = React.useState('white')
  const [p, setP] = React.useState('mendeleevchess')

  const onNewGame = () => {
    setColor(null)
  }

  return (
    <div className="AppContainer">
      <ToastContainer />

      {color ? (
        <Game color={color} onNewGame={onNewGame} />
      ) : (
        <div className="AppColor">
          <div className="password">
            <h2>Введите пароль</h2>
            <TextField
              onChange={(e) => setP(e.target.value)}
              value={p}
              type="password"
            />
          </div>
          <div
            className={classnames({
              transparent: right !== p,
            })}
          >
            <h2>И выберите ваш цвет</h2>
            <div className="Cards">
              <ButtonBase
                onClick={() => setColor('white')}
                disabled={right !== p}
              >
                <div className="CardWhite">Белый</div>
              </ButtonBase>
              <ButtonBase
                onClick={() => setColor('black')}
                disabled={right !== p}
              >
                <div className="CardBlack">Черный</div>
              </ButtonBase>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
