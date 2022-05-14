import React, { useState, ChangeEventHandler, ChangeEvent } from 'react'
import { render } from 'react-dom'
import { ChessBoard } from './module/ChessBoard'
import { Position } from 'chess-fen'
import { defaultRenderSquare } from './module/utils/renderers'
import { PromotionView } from './module/views/PromotionView'
import { positionContentToFenPiece } from 'chess-fen/utils'
import { BoardView } from './module/views/BoardView'
import { ChessBoardDndProvider } from './module/dnd/ChessBoardDndProvider'
import { Chess } from 'chess.js'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

const brownBoardTheme = {
  darkSquare: '#b58863',
  lightSquare: '#f0d9b5',
}

export interface Promotion {
  from: Position
  to: Position
}

export interface ControlledChessBoardProps {
  chess: Chess
  showWhiteThreat: boolean
  showBlackThreat: boolean
}

export const ControlledChessBoard: React.FC<ControlledChessBoardProps> = ({
  chess,
  showWhiteThreat,
  showBlackThreat,
}) => {
  const [fen, setFen] = useState(chess.fen())
  const [promotion, setPromotion] = useState<Promotion | null>(null)

  return (
    <>
      <ChessBoard
        fen={fen}
        onMove={(props) => {
          const { fromPosition, toPosition, board } = props

          if (board.isPromotion(fromPosition, toPosition)) {
            setPromotion({ from: fromPosition, to: toPosition })
          } else {
            chess.move({
              from: fromPosition.toCoordinate(),
              to: toPosition.toCoordinate(),
            })
            setFen(chess.fen())
          }
        }}
        renderBoard={({ resizeListener, children, ...props }) => (
          <BoardView
            onContextMenu={(event) => event.preventDefault()}
            onMouseUp={(event) => {
              if (event.button === 2) {
                console.log('Up click')
              }
            }}
            onMouseDown={(event) => {
              if (event.button === 2) {
                console.log('Down click')
              }
            }}
            {...props}
          >
            {resizeListener}
            {children}
          </BoardView>
        )}
        renderSquare={(props) => {
          if (promotion && promotion.to.equals(props.position)) {
            return (
              <PromotionView
                key={props.position.toCoordinate()}
                onClose={() => setPromotion(null)}
                onPromotion={(piece) => {
                  chess.move({
                    from: promotion.from.toCoordinate(),
                    to: promotion.to.toCoordinate(),
                    promotion: positionContentToFenPiece(piece).toLowerCase(),
                  })
                  setPromotion(null)
                  setFen(chess.fen())
                }}
                {...props}
              />
            )
          }

          return defaultRenderSquare(props)
        }}
        boardTheme={brownBoardTheme}
        showWhiteThreat
        showBlackThreat
      />
    </>
  )
}

const App = () => {
  const [showWhiteThreat, setWhiteThreat] = useState<boolean>(true)
  const [showBlackThreat, setBlackThreat] = useState<boolean>(true)

  const handleChangeWhiteTreat: ChangeEventHandler<HTMLInputElement> = (e) => {
    setWhiteThreat(e?.target?.checked)
  }

  const handleChangeBlackTreat: ChangeEventHandler<HTMLInputElement> = (e) => {
    setBlackThreat(e?.target?.checked)
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <ChessBoardDndProvider>
        <ControlledChessBoard
          chess={new Chess()}
          showWhiteThreat
          showBlackThreat
        />
      </ChessBoardDndProvider>
      <FormControlLabel
        control={
          <Switch
            defaultChecked={showWhiteThreat}
            onChange={handleChangeWhiteTreat}
          />
        }
        label="White"
      />
      <FormControlLabel
        control={
          <Switch
            defaultChecked={showBlackThreat}
            onChange={handleChangeBlackTreat}
          />
        }
        label="Black"
      />
    </div>
  )
}

render(<App />, document.getElementById('root'))
