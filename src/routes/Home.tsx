// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
import rpLogo from '../assets/rp_logo.png';
// import viteLogo from '/vite.svg'
import '../App.css';
// import axios from 'axios';
import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  HStack,
  Button,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  Stack,
  useColorMode,
  useColorModeValue,
  Link
} from '@chakra-ui/react';
import {HamburgerIcon, CloseIcon} from '@chakra-ui/icons';
import {ReactNode, useState} from 'react';
import {jwtDecode} from "jwt-decode";
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';
import Events from './pages/Events';
import Roles from './pages/Roles';
import Sponsors from './pages/Sponsors';
import Merch from './pages/Merch';
import React from 'react';
import EventCheckin from './pages/EventCheckin';

interface JwtPayload {
    roles: string[];
}

const Links = (): string[] => {
  const jwt = localStorage.getItem('jwt');
  const auth = jwt !== null;

  if (!auth) {
    return [];
  }

  const decodedToken = jwtDecode(jwt) as JwtPayload;

  if (decodedToken.roles.includes("ADMIN")) {
    return ['Dashboard', 'Stats', 'Events', 'Roles', 'Sponsors', 'Event Checkin', 'Merch'];
  } else if (decodedToken.roles.includes("STAFF")) {
    return ['Dashboard', 'Stats', 'Events', 'Event Checkin', 'Merch'];
  }

  return [];
};

/**
 * NavLink component.
 *
 * @param children - The content of the NavLink.
 * @param selectedLink - Whether the NavLink is selected.
 * @param onClick - The click event handler for the NavLink.
 */
const NavLink = ({children, selectedLink, onClick}: {
    children: ReactNode,
    selectedLink?: boolean,
    onClick: () => void
}) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    onClick={onClick}
    cursor="pointer"
    padding={'6px 12px'}
    border={selectedLink ? '1px solid' : 'none'}
    border-color={useColorModeValue('gray.700', 'gray.200')}>
    {children}
  </Link>
);

export default function Home() {
  const [userName, setUserName] = useState('Please Sign-In');
  const [selectedLink, setSelectedLink] = useState('Dashboard');
  const {toggleColorMode} = useColorMode();
  const {isOpen, onOpen, onClose} = useDisclosure();

    interface JwtPayload {
        displayName: string;
    }

    const decodeToken = () => {
      const jwt = localStorage.getItem("jwt");
      if (jwt) {
        const decodedToken = jwtDecode(jwt) as JwtPayload;
        setUserName(decodedToken.displayName);
      }
    };

    // const printToken = () => {
    //   console.log('Home page');
    //   const jwt = localStorage.getItem("jwt");
    //   console.log("jwt:", jwt);
    // }


    React.useEffect(() => {
      decodeToken();
    });


    const renderComponent = () => {
      switch (selectedLink) {
      case 'Dashboard':
        return <Dashboard name={userName}/>;
      case 'Stats':
        return <Stats/>;
      case 'Events':
        return <Events/>;
        // case 'Mail':
        //   return <Mail />;
        // case 'Notifications':
        //   return <Notifications />;
      case 'Roles':
        return <Roles/>;
      case 'Sponsors':
        return <Sponsors/>;
      case 'Merch':
        return <Merch/>;
      case 'Event Checkin':
        return <EventCheckin/>;
      default:
        return <Dashboard name={userName}/>;
      }
    };

    const signOut = () => {
      localStorage.removeItem("jwt");
      window.location.href = "/";
    };


    return (
      <>
        <Box
          bg={useColorModeValue('gray.100', 'gray.900')}
          px={4}
          position="fixed"
          top={0}
          left={0}
          width="100%"
          zIndex={1}
        >
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}
            bg={useColorModeValue('gray.100', 'gray.900')}>
            <IconButton
              size={'lg'}
              icon={isOpen ? <CloseIcon/> : <HamburgerIcon/>}
              aria-label={'Open Menu'}
              display={{md: 'none'}}
              onClick={isOpen ? onClose : onOpen}
            />
            <HStack spacing={8} alignItems={'center'}>
              <Flex align="center" mr={5} maxWidth={50}>
                <img src={rpLogo} className='logo' alt='R|P Logo' style={{width: '50px'}}
                  onClick={() => setSelectedLink('Dashboard')}/>
              </Flex>
              <HStack
                as={'nav'}
                spacing={4}
                display={{base: 'none', md: 'flex'}}>
                {Links().map((link) => (
                  <NavLink key={link} selectedLink={link === selectedLink}
                    onClick={() => setSelectedLink(link)}>{link}</NavLink>
                ))}
              </HStack>
            </HStack>
            <Flex alignItems={'center'}>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}>
                  <Avatar
                    size={'sm'}
                    src={
                      'https://cdn-icons-png.freepik.com/512/8742/8742495.png'
                    }
                  />
                </MenuButton>
                <MenuList>
                  {/* <MenuItem onClick={printToken}>Print {userName} JWT</MenuItem> */}
                  <MenuItem onClick={toggleColorMode}>Toggle Light/Dark Mode</MenuItem>
                  <MenuDivider/>
                  <MenuItem onClick={signOut}>Sign Out</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </Flex>

          {isOpen ? (
            <Box pb={4} display={{md: 'none'}}>
              <Stack as={'nav'} spacing={4}>
                {Links().map((link) => (
                  <NavLink key={link} onClick={() => setSelectedLink(link)}
                    selectedLink={link === selectedLink}>{link}</NavLink>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Box>

        <Box mt={16} flex="1" display="flex" flexDirection="column" minHeight='100vh'>
          {renderComponent()}
        </Box>
      </>
    );
}
