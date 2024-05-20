import React, { useState, useEffect } from 'react';

function DigitalClock() {

    return (
        <div className='clock-container'>
            <div className='clock'>
                <h1 className='title' hidden >Digital Clock</h1>
                <span>
                    <h1>12:00:00</h1>
                </span>
            </div>
        </div>
    );
}

export default DigitalClock;