import React from 'react';

const Table = ({ cities }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Town Hall</th>
        </tr>
      </thead>
      <tbody>
        { (cities.length > 0) ? cities.map( (city, index) => {
        console.log(city)
                   return (
                    <tr key={ index }>
                      <td>{ city.id }</td>
                      <td>{ city.name }</td>
                      <td>"..."</td>
                    </tr>
                  )
                 }) : <tr><td colSpan="5">Loading...</td></tr> }
      </tbody>
    </table>
  );
}

export default Table

