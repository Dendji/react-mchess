import { Slide, toast } from 'react-toastify'

const options = {
  position: 'top-center',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
  type: 'error',
  style: {
    fontWeight: 500,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  },
  transition: Slide,
}

export class message {
  static error(msg) {
    toast(msg, {
      ...options,
      type: 'error',
    })
  }
  static success(msg) {
    toast(msg, {
      ...options,
      type: 'success',
    })
  }
}
