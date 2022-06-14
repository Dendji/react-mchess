import React from 'react'
import ButtonBase from '@mui/material/ButtonBase'
import Game from './Game'
import { ToastContainer } from 'react-toastify'

export default function App(props) {
  const [color, setColor] = React.useState(null)

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
          <h2>Ваш цвет</h2>
          <div className="Cards">
            <ButtonBase onClick={() => setColor('white')}>
              <div className="CardWhite">Белый</div>
            </ButtonBase>
            <ButtonBase onClick={() => setColor('black')}>
              <div className="CardBlack">Черный</div>
            </ButtonBase>
          </div>
        </div>
      )}
    </div>
  )
}
