import React, { FC } from 'react'
import { Alert, Card, CardBody, CardText, CardTitle } from 'reactstrap'

import logo from '../../media/nobg_white.png'

interface Props {
  title?: string
  subtitle?: string
  error?: string | null
  poweredBy?: boolean
  children: React.ReactNode
}

export const LoginContainer: FC<Props> = props => {
  return (
    <div className="centered-container">
      <div className="middle">
        <div className="inner">
          <img className="logo" src={logo} alt="loading" />
          <Card body>
            <CardBody className="login-box">
              <div>
                <CardTitle>{props.title || 'Botpress Admin Panel'}</CardTitle>
                <CardText>{props.subtitle || ''}</CardText>
                {props.error && <Alert color="danger">{props.error}</Alert>}
                {props.children}
              </div>
            </CardBody>
          </Card>
          {props.poweredBy && (
            <div className="homepage">
              <p>
                Powered by <a href="https://botpress.io">Botpress</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
