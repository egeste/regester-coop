let isOpen = false
let isBlocked = false

const getIsOpen = () => isOpen
const getIsBlocked = () => isBlocked

const setIsOpen = (open = true) => isOpen = open
const setIsBlocked = (blocked = true) => isBlocked = blocked

module.exports = { getIsOpen, getIsBlocked, setIsOpen, setIsBlocked }
