import React, { useState } from 'react'
import Chessboard from 'chessboardjsx'
import { Chess } from 'chess.js'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import useMediaQuery from '@mui/material/useMediaQuery'

const API_ENDPOINT = `http://109.248.175.202:5000/api`

const Game = ({ color, onNewGame }) => {
  const matchesDesktop = useMediaQuery('(min-width:600px)')

  const [fen, setFen] = useState(null)
  const [isMoving, setMoving] = useState(false)
  const [checkmate, setCheckmate] = useState(false)
  const [endGame, setEndGame] = useState(false)
  const [lastFen, setLastFen] = useState(null)

  React.useEffect(() => {
    const init = async () => {
      const res = await axios.get(`${API_ENDPOINT}/init_${color}`)
      const { data } = res
      setFen(data.board)
      setLastFen(data.board)
    }
    init()
  }, [])

  const handleMove = async (move) => {
    const chess = new Chess(fen + ' 0 1')
    const board = fen
    setLastFen(board)
    const mv = chess.move(move)

    if (mv) {
      setMoving(true)
      setFen(chess.fen())
      const moveParam = `${mv.from}${mv.to}${mv.promotion ? mv.promotion : ''}`

      const res = await axios.get(`${API_ENDPOINT}`, {
        params: {
          board,
          move: moveParam,
        },
      })
      const { data } = res
      const { board: newBoard, checkmate, game_end } = data
      if (checkmate) {
        setCheckmate(checkmate)
      }
      if (game_end) {
        setEndGame(game_end)
      }
      setFen(newBoard)
      setMoving(false)
    }
  }

  const renderHeader = () => {
    if (endGame) return <h2>Игра завершена</h2>
    if (checkmate) return <h2>Шах и мат</h2>

    return isMoving ? (
      <h2 className="loading">
        {color === 'black' ? 'Белые' : 'Черные'} ходят
      </h2>
    ) : (
      <h2>Ход {color === 'black' ? 'черных' : 'белых'}</h2>
    )
  }

  const onUndo = () => {
    setMoving(false)
    setFen(lastFen)
  }

  const controls = (
    <div className="Controls">
      <Button variant="outlined" onClick={onUndo} className="NewGame">
        Отменить ход
      </Button>
      <Button variant="outlined" onClick={onNewGame} className="NewGame">
        Новая игра
      </Button>
    </div>
  )

  return (
    <div className="App">
      {fen ? (
        <div className="board">
          <div className="Header">
            {renderHeader()}
            {matchesDesktop ? controls : null}
          </div>
          <Chessboard
            draggable={!isMoving && !endGame}
            position={fen}
            calcWidth={({ screenWidth, screenHeight }) =>
              screenWidth > screenHeight
                ? screenHeight * 0.8
                : screenWidth * 0.9
            }
            boardStyle={{
              borderRadius: '5px',
              boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`,
            }}
            onDrop={(move) =>
              handleMove({
                from: move.sourceSquare,
                to: move.targetSquare,
                promotion: 'q',
              })
            }
          />
          {!matchesDesktop ? (
            <div className="MobileControls">{controls}</div>
          ) : null}
        </div>
      ) : (
        <CircularProgress color="inherit" />
      )}
    </div>
  )
}

export default Game
