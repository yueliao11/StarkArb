#[starknet::contract]
mod Arbitrage {
    use starknet::ContractAddress;
    use array::ArrayTrait;

    #[storage]
    struct Storage {
        owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
    }

    #[external]
    fn execute(
        ref self: ContractState,
        token_in: ContractAddress,
        token_out: ContractAddress, 
        buy_dex: felt252,
        sell_dex: felt252,
        amount_in: u256
    ) -> bool {
        // 1. 从用户转入token
        let success = IERC20Dispatcher { contract_address: token_in }
            .transfer_from(get_caller_address(), get_contract_address(), amount_in);
        assert(success, 'Transfer failed');

        // 2. 在buy_dex购买token_out
        let buy_amount = execute_swap(token_in, token_out, amount_in, buy_dex);

        // 3. 在sell_dex卖出token_out
        let sell_amount = execute_swap(token_out, token_in, buy_amount, sell_dex); 

        // 4. 将获利返回给用户
        let profit = sell_amount - amount_in;
        let success = IERC20Dispatcher { contract_address: token_in }
            .transfer(get_caller_address(), sell_amount);
        assert(success, 'Transfer failed');

        true
    }
} 