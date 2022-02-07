import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from '../components/pages/Home';
import About from '../components/pages/About';
import Error from '../components/pages/Error';

function Router() {
    return (
        <Routes>
            <Route path="/" element={<Home />} exact />

            <Route path="/about" element={<About />} />

            <Route path='*' element={<Error exact />} />
        </Routes>
    );
}

export default Router;
