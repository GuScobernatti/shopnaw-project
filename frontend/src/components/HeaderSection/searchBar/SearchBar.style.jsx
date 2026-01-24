import styled from "styled-components";

export const SearchBarContent = styled.div`
  background-color: #faf7f7;
  flex: 0.9;
  display: flex;
  align-items: center;
  height: 2.5em;
  padding: 10px;
  border-radius: 20px;
  max-width: 500px;

  .searchIcon {
    color: #a5a5a5;
    font-size: 1.2rem;
    transition: 0.2s;
    cursor: pointer;
    flex-shrink: 0;

    &:hover {
      color: #646464;
    }
  }

  @media (max-width: 600px) {
    height: 2.2em;
  }

  @media (min-width: 768px) {
    flex: 0 1 500px;
  }

  @media (max-width: 400px) {
    display: none;
  }
`;

export const SearchBarInput = styled.input`
  margin-right: 10px;
  outline: none;
  border: none;
  background-color: inherit;
  color: #757575;
  flex: 1;
  font-size: 0.95rem;

  &::placeholder {
    font-size: 0.9rem;
  }
`;
