declare enum MessageType {
    latest_block,
    login,
    logout,
    signup,
}

declare interface Message {
    type: MessageType
    payload: any
}
