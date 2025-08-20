#include <cstdlib>  
#include <cmath>     
extern "C" {
    bool is_move_valid(int fromRow, int fromCol, int toRow, int toCol) {
        if (fromRow == toRow || fromCol == toCol)
            return true;
        if (std::abs(fromRow - toRow) == std::abs(fromCol - toCol))
            return true;
        return false;
    }
}
