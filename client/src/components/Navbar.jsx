import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  // Mở/đóng menu khi nhấn vào icon menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Logo hoặc tên ứng dụng */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Giám sát Buồn Ngủ
        </Typography>

        {/* Menu icon cho mobile */}
        <IconButton
          color="inherit"
          aria-label="menu"
          edge="end"
          onClick={handleMenuClick}
          sx={{ display: { xs: 'block', md: 'none' } }} // Hiển thị menu icon chỉ trên màn hình nhỏ
        >
          <MenuIcon />
        </IconButton>

        {/* Menu cho mobile */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Trang chủ</MenuItem>
          <MenuItem onClick={handleMenuClose}>Về chúng tôi</MenuItem>
          <MenuItem onClick={handleMenuClose}>Liên hệ</MenuItem>
        </Menu>

        {/* Các nút điều hướng cho desktop */}
        <Button color="inherit">Trang chủ</Button>
        <Button color="inherit">Về chúng tôi</Button>
        <Button color="inherit">Liên hệ</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
