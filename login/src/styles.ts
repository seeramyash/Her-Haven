import styled from "styled-components";

const TRANSITION_TIME = 0.3;

export const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  
  .container {
    display: flex;
    align-items: center;
    background-color: #fff;
    box-shadow: 0 7px 0.875rem rgba(0, 0, 0, 0.1), 0 5px 5px rgba(0, 0, 0, 0.1);
    position: relative;
    width: 768px;
    max-width: 100%;
    min-height: 480px;
    animation: fadeInUp 0.8s ease-out;
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .form-container {
      position: absolute;
      top: 0;
      height: 100%;
      transition: all ${TRANSITION_TIME - 0.05}s ease-in-out;

      form {
        background-color: #ffffff;
        display: flex;
        align-items: start;
        flex-direction: column;
        padding: 2rem 3rem;
        min-height: 100%;
        text-align: center;

        h1 {
          margin: 0 auto 1.5rem auto;
          font-family: 'Inter', sans-serif;
          animation: slideInDown 0.6s ease-out;
          
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        input {
          border: none;
          padding: 0.75rem 1rem;
          margin: 0.5rem 0;
          width: 100%;
          border: 1px solid #bdbdbd;
          border-radius: 3px;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.3s ease;
          animation: fadeIn 0.8s ease-out backwards;
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          :focus {
            outline: none;
            border-color: #dfa7a1;
            box-shadow: 0 0 0 3px rgba(223, 167, 161, 0.1);
            transform: translateY(-2px);
          }
          
          :hover {
            border-color: #f9d5d1;
          }
          
          &:nth-of-type(1) {
            animation-delay: 0.1s;
          }
          &:nth-of-type(2) {
            animation-delay: 0.2s;
          }
          &:nth-of-type(3) {
            animation-delay: 0.3s;
          }
        }

        label {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          animation: fadeIn 0.8s ease-out backwards;
          
          &:nth-of-type(1) {
            animation-delay: 0s;
          }
          &:nth-of-type(2) {
            animation-delay: 0.1s;
          }
          &:nth-of-type(3) {
            animation-delay: 0.2s;
          }
        }
        
        span.link {
          color: #333;
          font-size: 0.875rem;
          font-family: 'Inter', sans-serif;
          text-decoration: none;
          margin-left: auto;
          cursor: pointer;
          text-decoration: underline;
          transition: all 0.3s ease;
          animation: fadeIn 0.8s ease-out 0.5s backwards;
          
          :hover {
            color: #dfa7a1;
            transform: translateX(2px);
          }
        }

        button {
          border-radius: 20px;
          border: none;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          padding: 0.75rem 1.5rem;
          letter-spacing: 0.5px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          animation: fadeIn 0.8s ease-out 0.4s backwards;
          position: relative;
          overflow: hidden;

          :hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          }

          :active {
            transform: translateY(0) scale(0.98);
          }

          :focus {
            outline: none;
          }
          
          ::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          
          :hover::before {
            width: 300px;
            height: 300px;
          }
        }
      }

      &.sign-in-container {
        left: 0;
        width: 50%;
        z-index: 2;

        button {
          background-color: #dfa7a1;
          :hover {
            background-color: #f9d5d1;
          }
        }
      }

      &.sign-up-container {
        left: 0;
        width: 50%;
        opacity: 0;
        z-index: 1;

        button {
          background-color: #1f2934;
          :hover {
            background-color: #314456;
          }
        }
      }
    }

    .overlay-container {
      position: absolute;
      margin: auto 0;
      left: 50%;
      width: 50%;
      height: 120%;
      overflow: hidden;
      transition: transform ${TRANSITION_TIME}s ease-in-out;
      z-index: 100;
      transform: translateX(5px);

      .overlay {
        background: linear-gradient(135deg, #f9d5d1 0%, #dfa7a1 100%);
        color: #1f2934;
        position: relative;
        left: -100%;
        height: 100%;
        width: 200%;
        transform: translateX(0);
        transition: transform ${TRANSITION_TIME}s ease-in-out, background ${TRANSITION_TIME}s ease-in-out,
          color ${TRANSITION_TIME}s ease-in-out;

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 2.5rem;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform ${TRANSITION_TIME}s ease-in-out;

          p {
            font-size: 1.3rem;
            margin: 0;
            line-height: 1.7rem;
          }

          .title {
            font-size: 2.75rem;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            margin-bottom: 1rem;
            animation: fadeInScale 0.8s ease-out;
            
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          }
          
          p {
            animation: fadeIn 0.8s ease-out 0.2s backwards;
          }

          &.overlay-left {
            transform: translateX(-20%);
          }

          &.overlay-right {
            right: 0;
            transform: translateX(0);
          }
        }
      }
    }

    &.signup-active {
      .form-container {
        &.sign-in-container {
          transform: translateX(100%);
        }

        &.sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show ${TRANSITION_TIME}s ease-in-out;

          @keyframes show {
            0%,
            49.99% {
              opacity: 0;
              z-index: 1;
            }

            50%,
            100% {
              opacity: 1;
              z-index: 5;
            }
          }
        }
      }

      .overlay-container {
        transform: translateX(calc(-100% - 5px));

        .overlay {
          transform: translateX(50%);
          background: linear-gradient(135deg, #314456 0%, #1f2934 100%);
          color: #f9d5d1;

          .overlay-panel {
            &.overlay-left {
              transform: translateX(0);
            }

            &.overlay-right {
              transform: translateX(20%);
            }
          }
        }
      }
    }
  }
`;
