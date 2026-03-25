import React from 'react';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer';
import { CartDrawer } from '../cart-drawer';

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
    <CartDrawer />
  </>
);
