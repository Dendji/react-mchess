import React, { useState } from 'react'
import Chessboard from 'chessboardjsx'
import { Chess } from 'chess.js'
import axios from 'axios'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import { message } from './utils/toast'

const API_ENDPOINT = `http://109.248.175.231:5000/api`

const Game = ({ color, onNewGame }) => {
  const matchesDesktop = useMediaQuery('(min-width:600px)')

  const [fen, setFen] = useState(null)
  const [isMoving, setMoving] = useState(false)
  const [checkmate, setCheckmate] = useState(false)
  const [endGame, setEndGame] = useState(false)
  const [hoveredSquare, setHoveredSquare] = useState(null)
  const [pieceSquare, setPieceSquare] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [dropSquareStyle, setDropSquareStyle] = useState(null)

  const onDragOverSquare = (square) => {
    setDropSquareStyle(
      square === 'e4' || square === 'd4' || square === 'e5' || square === 'd5'
        ? { backgroundColor: 'cornFlowerBlue' }
        : { boxShadow: 'inset 0 0 1px 4px rgb(255, 255, 0)' },
    )
  }

  React.useEffect(() => {
    const init = async () => {
      const res = await axios.get(`${API_ENDPOINT}/init_${color}`)
      const { data } = res
      setFen(data.board)
      setSessionId(data.session_id)
    }
    init()

    // return () => clearInterval(intervalId);
  }, [])

  React.useEffect(() => {
    let intervalId = null
    if (sessionId) {
      intervalId = setInterval(async () => {
        const res = await axios.get(`${API_ENDPOINT}/ping`, {
          params: {
            session_id: sessionId,
          },
        })

        if (res.status !== 200) {
          message.error(`Произошла ошибка при ping. Статус: ${res.status}`)
          clearInterval(intervalId)
          onNewGame()
        }
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [sessionId])

  const handleMove = async (move) => {
    const chess = new Chess(fen + ' 0 1')
    const mv = chess.move(move)

    if (mv) {
      setMoving(true)
      setFen(chess.fen())
      const moveParam = `${mv.from}${mv.to}${mv.promotion ? mv.promotion : ''}`

      const res = await axios.get(`${API_ENDPOINT}`, {
        params: {
          move: moveParam,
          session_id: sessionId,
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

  const onUndo = async () => {
    const res = await axios.get(`${API_ENDPOINT}/cancel_move`, {
      params: {
        session_id: sessionId,
      },
    })
    const { data } = res
    const { board, checkmate, game_end } = data
    message.success('Ход отменён')
    if (checkmate) {
      setCheckmate(checkmate)
    }
    if (game_end) {
      setEndGame(game_end)
    }
    setFen(board)
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

  const onSquareClick = async (square) => {
    if (isMoving) return
    const chess = new Chess(fen + ' 0 1')

    setPieceSquare(square)

    let mv = chess.move({
      from: pieceSquare,
      to: square,
      promotion: 'q', // always promote to a queen for example simplicity
    })

    if (mv === null) return

    if (mv) {
      setPieceSquare(null)
      setMoving(true)
      setFen(chess.fen())
      const moveParam = `${mv.from}${mv.to}${mv.promotion ? mv.promotion : ''}`

      const res = await axios.get(`${API_ENDPOINT}`, {
        params: {
          move: moveParam,
          session_id: sessionId,
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

  return (
    <div className="App">
      {fen ? (
        <div className="board">
          <div className="Header">
            {renderHeader()}
            {matchesDesktop ? controls : null}
          </div>
          <Chessboard
            onDragOverSquare={onDragOverSquare}
            dropSquareStyle={dropSquareStyle}
            draggable={!isMoving && !endGame}
            position={fen}
            calcWidth={({ screenWidth, screenHeight }) =>
              screenWidth > screenHeight
                ? screenHeight * 0.8
                : screenWidth * 0.9
            }
            squareStyles={{
              [pieceSquare]: {
                background: '#fffc00',
              },
              [hoveredSquare]: pieceSquare
                ? {
                    border: '2px solid #fffc00',
                    boxSizing: 'border-box',
                  }
                : {},
            }}
            onMouseOverSquare={(s) => setHoveredSquare(s)}
            onSquareClick={onSquareClick}
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
