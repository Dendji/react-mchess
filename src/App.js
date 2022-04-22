import React, { useState } from 'react'
import './App.css'
import Chessboard from 'chessboardjsx'
import { Chess } from 'chess.js'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'

const API_ENDPOINT = `http://109.248.175.202:5000/api`

const App = () => {
  const [fen, setFen] = useState(null)
  const [isMoving, setMoving] = useState(false)

  React.useEffect(() => {
    const init = async () => {
      const res = await axios.get(`${API_ENDPOINT}/init_black`)
      const { data } = res
      setFen(data.board)
    }
    init()
  }, [])

  const handleMove = async (move) => {
    const chess = new Chess(fen + ' 0 1')
    const board = fen
    if (chess.move(move)) {
      setMoving(true)
      setFen(chess.fen())
      const res = await axios.get(`${API_ENDPOINT}`, {
        params: {
          board,
          move: move.from + move.to,
        },
      })
      const { data } = res
      setFen(data.board)
      setMoving(false)
    }
  }

  return (
    <div className="App">
      {fen ? (
        <div className="board">
          {isMoving ? (
            <h2 className="loading">Белые ходят</h2>
          ) : (
            <h2>Ход черных</h2>
          )}
          <Chessboard
            draggable={!isMoving}
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
        </div>
      ) : (
        <CircularProgress color="inherit" />
      )}
    </div>
  )
}

export default App
