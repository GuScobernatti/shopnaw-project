import styled from "styled-components";

export const SearchBarContent = styled.div`
  background-color: #faf7f7;
  flex: 0.9;
  display: flex;
  align-items: center;
  height: 2em;
  padding: 10px;
  border-radius: 8px;

  .searchIcon {
    color: #a5a5a5;
    transition: 0.2s;
    cursor: pointer;

    &:hover {
      color: #646464;
    }
  }

  @media (min-width: 768px) {
    flex: 0 1 500px;
  }
`;

export const SearchBarInput = styled.input`
  margin-right: 10px;
  outline: none;
  border: none;
  background-color: inherit;
  flex: 1;
  color: #757575;
`;
