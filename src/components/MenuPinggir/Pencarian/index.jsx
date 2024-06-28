/** @jsxImportSource @emotion/react */

import { FaBars, FaSearch, FaTimes } from "react-icons/fa"

const MenuPinggirPencarian = () => {
  return (
    <div
      css={{
        backgroundImage: `url('https://asset.kompas.com/crops/F5LjbmLcmn0giHEPgGYRVEh7ShU=/162x113:838x563/750x500/data/photo/2023/02/02/63db4bb5c8574.jpg')`,
        height: 240,
        padding: 8,
        backgroundSize: 'cover', // Agar gambar menutupi seluruh area div
        backgroundPosition: 'center',
      }}
    >
      <div
        css={{
          borderRadius: 8,
          height: 40,
          background: "#fafafa",
          display: "flex",
          flexDirection: "row",
          gap: 8,
          paddingLeft: 16,
          paddingRight: 16,
          alignItems: "center",
        }}
      >
        <FaBars />
        <input
          placeholder="Cari Lokasi . . ."
          css={{
            flexGrow: 1,
            border: `none`,
          }}
        />
        <FaSearch />
        <FaTimes />
      </div> 
    </div>
  )
}

export default MenuPinggirPencarian 
